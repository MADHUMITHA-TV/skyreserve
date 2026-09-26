# AI Features — Agentic Booking Assistant, RAG Policy Support, and Booking Summaries

This document covers three AI features layered on top of SkyReserve's existing, already-tested REST APIs. None of them reimplement booking, locking, or payment logic — they orchestrate the real endpoints the rest of the app already uses.

1. **Conversational booking agent** — natural language → tool-use over real flight search, seat locking, and payment APIs
2. **RAG policy support chatbot** — grounded Q&A over baggage/cancellation/refund policy
3. **LLM-generated booking summaries** — structured JSON → human-readable confirmation text

---

## 1. Conversational Booking Agent

**Endpoint:** `POST /api/v1/agent/chat`
**Files:** `backend/src/modules/agent/`

### Architecture

```
User message
   │
   ▼
agent.controller.js  (auth, request validation)
   │
   ▼
agent.orchestrator.js  (multi-turn loop, confirmation gating, DB logging)
   │              │
   ▼              ▼
agent.llm.js   agent.executor.js
(Gemini)       (calls real services: flight, booking, payment)
```

- **`agent.tools.js`** — tool schemas (JSON Schema / Anthropic-style `input_schema`), one per real capability: `resolve_airport`, `search_flights`, `check_seat_availability`, `lock_seat`, `create_booking`, `initiate_payment`, `confirm_payment`, `get_my_bookings`, `cancel_booking`.
- **`agent.llm.js`** — the only file that imports the Gemini SDK. Converts our JSON-Schema tool defs into Gemini's `functionDeclarations` shape and calls `generateContent`. Swapping to the Anthropic API (e.g. for a live demo, since Anthropic's tool-use format is nearly identical to what's already in `agent.tools.js`) means rewriting this one file — the orchestrator, executor, and tool schemas don't change.
- **`agent.executor.js`** — runs one tool call against the real service layer (`flight.service.js`, `booking.service.js`, `payment.service.js`, etc.). No booking/payment logic is duplicated here.
- **`agent.orchestrator.js`** — the multi-turn loop: call LLM → get tool call(s) → execute → feed results back → repeat until the model returns plain text. Persists conversation state (`AgentConversation.historyJson`) between HTTP requests, since Gemini itself is stateless per call.

### Security model (the part that matters most)

The LLM's tool arguments are **never trusted as authorization**. Specifically:
- `userId` is never a field the LLM can set (see `agent.tools.js` — `lock_seat`, `create_booking`, etc. have no `user_id` param at all). It's read from `req.user.id` (JWT) in the controller and threaded through as `ctx`, same as every existing controller in the app.
- `initiate_payment` and `confirm_payment` re-fetch the booking/payment and check `booking.userId === ctx.userId` **in the tool executor**, as defense-in-depth — this was added after finding that the underlying `payment.service.js` has no ownership check at all (a pre-existing gap in the REST API, not introduced by the agent; still open, see "Known gaps" below).
- Idempotency keys and simulated transaction IDs are generated **server-side, deterministically**, never accepted from the LLM.

### Confirmation gating

`confirm_payment` and `cancel_booking` are in `SENSITIVE_TOOLS` (`agent.tools.js`). When the model tries to call either, `agent.orchestrator.js` **intercepts before execution** — it doesn't run the tool, doesn't trust the model's own summary, and instead:
1. Fetches the real payment/booking from the DB itself
2. Builds a confirmation message from that real data (so the ₹ amount shown can't be a hallucination)
3. Saves the pending action and returns `requiresConfirmation: true`
4. Only executes on a follow-up request carrying the **structured** `confirm: true` flag — not parsed "yes"/"confirm" text. The frontend renders this as explicit Confirm/Cancel buttons rather than relying on free text.

This means the confirmation step is enforced by the server regardless of what the model decides — a prompt-injection or a model that "forgets" the rule can't bypass it.

### Failure handling

If `lock_seat` fails (seat taken), `agent.executor.js` catches the underlying `ApiError` and returns `{success: false}` instead of throwing — the model sees this in its next turn and, per the system prompt, tells the user and calls `check_seat_availability` again for real alternatives, rather than retrying blindly or claiming success.

### Reasoning trace / eval logging

Every tool call — regardless of success or failure — is logged to `AgentToolCall` (tool name, full input, full output, status, error message, duration, timestamp), linked to an `AgentConversation`. This is queryable directly for building an eval set: e.g. "show me every conversation that called `lock_seat` and got a conflict" or "average tool calls per completed booking."

### Ownership gaps — found, then fixed

While building the agent, three IDOR-style gaps were found in the core REST API (not introduced by the agent — pre-existing):
- `GET /bookings/:id` had no ownership check — any authenticated user could view any booking by ID.
- `POST /payments`, `POST /payments/:id/pay`, `POST /payments/:id/refund`, `GET /payments/:id`, and `GET /payments/booking/:bookingId` had no ownership check — any authenticated user could create, complete, refund, or view any payment.
- `GET /payments` (list all payments) had no role restriction at all — any authenticated customer could list every payment in the system, not just admins.

**All six were fixed directly in `booking.controller.js` and `payment.controller.js`** (ownership checks: `booking.userId === req.user.id || req.user.role === "ADMIN"`) and `payment.routes.js` (`authorizeRoles("ADMIN")` added to the list-all route) — verified by confirming a second real user is blocked (`403`) from a booking that isn't theirs, while their own bookings remain accessible. The agent's tool executor still keeps its own defense-in-depth ownership checks on top of this, since a second layer of protection at the orchestration boundary is worth keeping regardless of what the REST layer does.

### Still open

- `createNewBooking` doesn't verify the Redis lock before booking a seat — it only checks the DB's `AVAILABLE` status, and the write isn't conditional (`WHERE status = AVAILABLE`), so two concurrent `create_booking` calls on the same seat could theoretically race. Not yet fixed — would need a conditional update (`updateMany` with a `status: AVAILABLE` filter, checking the affected-row count) inside the booking transaction.

---

## 2. RAG Policy Support Chatbot

**Endpoint:** `POST /api/v1/support/chat`
**Files:** `backend/src/modules/policy/`, `backend/policies/*.md`, `backend/scripts/embedPolicies.js`

### Why no vector database

The corpus is three short policy documents (~19 chunks total after splitting by `## heading`). `pgvector` requires PostgreSQL (this project is MySQL); Redis Vector Search requires the `redis-stack` image, not the plain `redis` image already in use. At this scale, a dedicated vector engine is the wrong tool — chunks + their embeddings are stored as a JSON column on `PolicyChunk` (plain MySQL), and retrieval is brute-force cosine similarity computed in Node at query time. Sub-millisecond for ~20 vectors. Revisit if the corpus grows into the thousands.

### Why local embeddings

`@huggingface/transformers` running `Xenova/all-MiniLM-L6-v2` entirely on CPU — no API key, no per-call cost, no network dependency after the one-time model download (~23MB, cached locally). Ingestion (`scripts/embedPolicies.js`) and query-time retrieval (`policy.retriever.js`) share the same embedding function (`policy/embedding.js`) — embeddings from different models aren't comparable, so this is enforced by having only one place either side can get an embedding from.

### Flow

1. `scripts/embedPolicies.js` reads every `.md` file in `backend/policies/`, splits by `## heading` into chunks, embeds each with the local model, stores in `PolicyChunk`. Re-runnable any time policy docs change (clears old chunks for a source first).
2. `POST /support/chat` embeds the incoming question with the same model, ranks all stored chunks by cosine similarity, takes the top 4.
3. The top chunks are handed to Gemini (`agent.llm.js` → `answerPolicyQuestion`) with a system prompt that restricts it to answering **only** from the provided excerpts, and to say so plainly if the excerpts don't cover the question — rather than falling back on general airline-industry knowledge. Verified in testing: asked about power banks under 100Wh (a case the policy doc doesn't specify), it correctly said it didn't have that detail rather than guessing.
4. Every question is logged to `PolicySupportLog` (question, which chunk IDs were retrieved, the generated answer) — same eval-set purpose as `AgentToolCall`, letting you separately check retrieval quality vs. answer quality.

---

## 3. LLM-Generated Booking Summaries

**Endpoint:** `GET /api/v1/bookings-summary/:id`
**Files:** `backend/src/modules/summary/`, `generateBookingSummary` in `agent.llm.js`

Pure data-to-text: fetches the real booking (flight, seat, passengers, payment — via the existing `fetchBookingById`), reduces it to plain JSON, and asks Gemini to phrase it as a warm, accurate confirmation message. No tools, no retrieval, no multi-turn state — the lowest-risk of the three features, since there's nothing for the model to reason about beyond phrasing already-correct data. Same ownership check pattern as the payment tools (booking must belong to the requesting user, or requester must be `ADMIN`).

---

## Provider-agnostic by design

`agent.llm.js` is the only file in the entire feature set that imports `@google/genai`. Every other file — `agent.orchestrator.js`, `agent.executor.js`, `agent.tools.js`, `policy.controller.js`, `summary.controller.js` — talks to it through three plain functions: `callAgentLLM`, `answerPolicyQuestion`, `generateBookingSummary`. Swapping Gemini's free tier for the Anthropic API (e.g. for a live interview demo) is a rewrite of this one file; the tool schemas are already in the JSON-Schema shape Anthropic's tool-use API expects natively.

## New environment variables

```
GEMINI_API_KEY=          # https://aistudio.google.com/apikey — free tier, no card required
AGENT_MODEL_NAME=        # currently gemini-3.6-flash; check ai.google.dev/gemini-api/docs/models
                          # if this 404s (Google renames/deprecates free-tier models periodically)
AGENT_MAX_TURNS=6        # safety cap on tool-call round-trips per chat turn
```

## Demo script (what to actually type)

1. **Booking agent:** *"book me a window seat to Chennai next Friday under 5000 rupees"* → answer its follow-ups (departure city, exact date if asked, seat choice, passenger name) → when it summarizes and asks for payment method, give one → when it asks to confirm, click the **Confirm** button (not typed text) → booking completes with a real transaction ID.
2. **Failure path:** try booking a seat that's already taken (e.g. `1A` on `SR102` after the above) → agent should say it's unavailable and offer real alternatives from a fresh availability check, not retry silently.
3. **RAG support:** switch to the Policy Support tab → *"can I carry a power bank in my checked baggage?"* → answer should cite the Baggage Policy specifically, with source chips shown.
4. **Booking summary:** `GET /api/v1/bookings-summary/:id` on a completed booking → returns a written confirmation paragraph, not a data dump.

## Known limitation: free-tier quota

Gemini's free tier caps at **20 requests/day per model** (resets at midnight Pacific Time). One full multi-turn booking conversation can use 5-8 of those (one Gemini call per tool-call round-trip, not one per user message). This is a real constraint during development and demoing — the provider-agnostic design above exists partly because of this; a paid key or an alternate provider removes the cap entirely, at a genuinely small real cost for a project this size.