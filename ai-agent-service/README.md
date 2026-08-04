# SkyReserve AI Agent Service

A separate Python (FastAPI) microservice that adds a natural-language,
agentic booking assistant on top of your **existing** SkyReserve
Node/Express backend. Your Node backend is untouched — this service
just calls its REST APIs (`/flights`, `/bookings`, `/payments`) the
same way your React frontend already does.

## Architecture

```
React frontend  --(existing)-->  Node/Express backend (unchanged)
       |
       +-----(new)----->  FastAPI AI Agent Service  --(HTTP, same JWT)--> Node/Express backend
```

The user talks to the agent in plain English. Claude decides which
tools to call (search flights, lock a seat, create a booking, pay),
and each tool is just an HTTP call into your real backend — so your
Redis locking, Prisma models, and idempotent payment logic all keep
working exactly as they do today.

## Setup

```bash
cd ai-agent-service
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # then fill in your ANTHROPIC_API_KEY
uvicorn main:app --reload --port 8000
```

Make sure your existing Node backend is running (e.g. on port 5000).

## Using it

Get a JWT the normal way (log in through your existing `/api/v1/auth`
endpoint), then:

```bash
curl -X POST http://localhost:8000/chat \
  -H "Authorization: Bearer <your-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"message": "Find me a flight from Chennai to Delhi on 14th August"}'
```

Keep passing the `history` field back on each request to maintain a
multi-turn conversation (e.g. "book the second one" refers to
context from the previous turn).

## Wiring into your React frontend

Add a simple chat widget (a text box + message list) that calls
`POST http://localhost:8000/chat` with the user's message and the
current `history` array, the same way `bookingService.js` currently
calls your Node backend. Store `history` in React state between turns.

## Resume-ready framing

"Built a Python FastAPI microservice that adds an LLM-based
function-calling agent on top of an existing Node/Express +
Redis-locked booking system, enabling natural-language reservation
requests to invoke existing REST APIs (flight search, seat locking,
idempotent payments) without modifying backend logic."