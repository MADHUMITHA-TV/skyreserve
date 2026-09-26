/**
 * agent.llm.js
 *
 * Thin adapter around the Gemini API's function-calling endpoint.
 *
 * WHY THIS FILE EXISTS SEPARATELY: agent.orchestrator.js (step 4) should
 * never import `@google/genai` directly. It should only ever call
 * `callAgentLLM(...)` from this file. That means swapping Gemini for the
 * Anthropic API later (e.g. for a live interview demo) is a rewrite of
 * THIS FILE ONLY — the orchestration loop, the tool-call logging, the
 * confirmation gating, none of that has to change.
 *
 * Uses `ai.models.generateContent()` (the stable, fully-supported Gemini
 * endpoint), not the newer Interactions API — see conversation notes for
 * why. Confirmed against Google's own docs and SDK examples as of this
 * writing; re-check https://ai.google.dev/gemini-api/docs if this starts
 * throwing shape-mismatch errors, since provider SDKs do change.
 */

import { GoogleGenAI } from "@google/genai";

import config from "../../config/index.js";
import { AGENT_TOOLS } from "./agent.tools.js";

const ai = new GoogleGenAI({ apiKey: config.env.agent.geminiApiKey });

/**
 * SkyReserve's tool schemas (agent.tools.js) already use JSON Schema in
 * the `input_schema` field. Gemini's SDK wants the same JSON Schema, just
 * under a differently-named field (`parametersJsonSchema`) inside a
 * `functionDeclarations` array. No semantic conversion needed, just
 * reshaping — which is exactly why keeping input_schema as plain JSON
 * Schema in agent.tools.js (rather than some Anthropic-only shape) was
 * worth doing up front.
 */
function toGeminiFunctionDeclarations(tools) {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parametersJsonSchema: tool.input_schema
  }));
}

const GEMINI_TOOLS = [{ functionDeclarations: toGeminiFunctionDeclarations(AGENT_TOOLS) }];

export const SYSTEM_PROMPT = `You are the SkyReserve booking assistant, a conversational layer over a real airline reservation system. You do not implement booking logic yourself — every action you take is a tool call into SkyReserve's existing, already-tested backend.

CORE RULES — follow these exactly:

1. NEVER GUESS MISSING INFORMATION. If the user's request is missing something you need (destination, date, seat preference, budget, passenger names), ask ONE clear clarifying question before calling any tool that needs it. Do not assume a date, do not assume "any seat is fine", do not invent passenger names. It is always better to ask than to guess.

2. RESOLVE PLACES BEFORE SEARCHING. Airport IDs are internal database IDs, never city names or codes. Always call resolve_airport for any city/airport the user mentions before calling search_flights. Never invent or guess an airport ID.

3. NEVER FABRICATE IDS OR RESULTS. Every flight_id, seat_id, booking_id, and payment_id you use in a tool call must have come from a previous tool result in this conversation. If you don't have one, call the tool that produces it first. Never state that a booking or payment succeeded unless a tool result actually confirmed it.

4. HANDLE FAILURES HONESTLY, DON'T RETRY BLINDLY. If lock_seat fails because the seat is already taken, tell the user plainly, then call check_seat_availability again to offer real alternatives. Do not silently retry the same seat, and do not tell the user it worked when it didn't.

5. PAYMENT NEEDS EXPLICIT CONFIRMATION, EVERY TIME. Before calling confirm_payment, you must have already summarized the booking (flight, seat, passengers, amount) in plain language AND the user's most recent message must be a clear, specific confirmation ("yes", "confirm", "go ahead", "book it") — not just an earlier answer to a different question. If there is any doubt whether they've confirmed, ask again instead of calling confirm_payment. This step moves real money and cannot be undone through this chat.

6. STAY CONVERSATIONAL. Respond like a helpful airline agent, not a JSON dump. Keep replies concise. Don't narrate which tools you're calling — just use them and report the outcome in plain language.

7. STAY IN SCOPE. You help with searching flights, booking, seats, payment, and viewing/cancelling the user's own bookings. For anything else (baggage policy, refunds, general questions), say that's handled by a different part of SkyReserve's support (a RAG-based policy assistant is planned separately) rather than guessing at policy.`;

/**
 * Calls Gemini with the full conversation so far and the fixed tool list.
 *
 * @param {Array} contents - Gemini-shaped conversation history, e.g.
 *   [{ role: "user", parts: [{ text: "..." }] },
 *    { role: "model", parts: [{ functionCall: {...} }] },
 *    { role: "user", parts: [{ functionResponse: {...} }] }, ...]
 *   The caller (agent.orchestrator.js) owns building/appending to this
 *   array — this function is a pure request/response wrapper, no state.
 *
 * @returns {Promise<{
 *   functionCalls: Array<{ id: string|undefined, name: string, args: object }>,
 *   text: string | null,
 *   modelContent: object | null
 * }>}
 */
export async function callAgentLLM(contents) {
  const response = await ai.models.generateContent({
    model: config.env.agent.modelName,
    contents,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      tools: GEMINI_TOOLS
    }
  });

  const candidate = response.candidates?.[0];

  // Gemini 3.x requires each functionResponse to echo back the matching
  // functionCall's `id` (see Google's Gemini 3 migration docs) — without
  // it, multi-turn tool use silently breaks on newer models. We capture
  // it here so the orchestrator doesn't have to know this SDK detail.
  const functionCalls = (response.functionCalls ?? []).map((fc) => ({
    id: fc.id,
    name: fc.name,
    args: fc.args ?? {}
  }));

  return {
    functionCalls,
    text: response.text ?? null,
    // The model's turn, exactly as Gemini returned it (role + parts,
    // including any thought signatures). Push this into `contents`
    // verbatim rather than reconstructing it — reconstructing risks
    // dropping fields future Gemini versions expect to see echoed back.
    modelContent: candidate?.content ?? null
  };
}

const POLICY_SYSTEM_PROMPT = `You are SkyReserve's policy support assistant. You answer questions about baggage, cancellation, and refund policy.

CRITICAL: answer ONLY using the policy excerpts provided in the user's message. Do not use outside knowledge about airlines in general, and do not guess at SkyReserve-specific numbers (fees, timeframes, weight limits) that aren't in the excerpts.

If the excerpts don't contain enough information to answer, say so plainly ("I don't have that specific detail in our policy documents — you may want to contact support directly") rather than guessing or extrapolating.

When you use a specific rule or number, mention which policy area it's from (e.g. "under the Cancellation Policy...") so the answer is easy to verify. Keep answers conversational and concise — a few sentences, not a wall of text.`;

/**
 * RAG answer generation — no tools, just grounded generation over
 * retrieved chunks. Separate system prompt from the booking agent's,
 * since this assistant should never try to book/cancel/pay anything,
 * only answer questions about policy.
 *
 * @param {string} question
 * @param {Array<{source: string, sectionTitle: string, content: string}>} chunks
 * @returns {Promise<string>}
 */
export async function answerPolicyQuestion(question, chunks) {
  const context = chunks
    .map((c, i) => `[${i + 1}] (${c.source} — ${c.sectionTitle})\n${c.content}`)
    .join("\n\n");

  const prompt = `Policy excerpts:\n\n${context}\n\nQuestion: ${question}`;

  const response = await ai.models.generateContent({
    model: config.env.agent.modelName,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { systemInstruction: POLICY_SYSTEM_PROMPT }
  });

  return response.text ?? "Sorry, I couldn't come up with an answer — could you rephrase that?";
}

const SUMMARY_SYSTEM_PROMPT = `You turn structured SkyReserve booking data into a warm, clear, human-readable booking confirmation — the kind of message a real airline would email a passenger.

Rules:
- Use ONLY the data provided. Never invent flight times, amounts, names, or any other detail not present in the JSON.
- Write in plain, friendly prose, not a bulleted data dump — but do make sure every important fact (flight number, route, date/time, seat, passenger names, amount paid, booking code) is clearly stated somewhere.
- Keep it to a short paragraph or two. This is a confirmation message, not a marketing email — no upsells, no "we think you'll also love..." additions.
- Sign off simply, as SkyReserve.`;

/**
 * Data-to-text: turns a structured booking object into a human-readable
 * confirmation summary. No tools, no retrieval — just formatting real
 * data into prose, which is why hallucination risk here is low (there's
 * nothing to "reason" about, only to phrase well).
 *
 * @param {object} bookingData - plain JSON, not a Prisma model instance
 * @returns {Promise<string>}
 */
export async function generateBookingSummary(bookingData) {
  const prompt = `Booking data:\n${JSON.stringify(bookingData, null, 2)}\n\nWrite the confirmation message.`;

  const response = await ai.models.generateContent({
    model: config.env.agent.modelName,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { systemInstruction: SUMMARY_SYSTEM_PROMPT }
  });

  return response.text ?? null;
}