/**
 * test-agent-llm.js
 *
 * Standalone smoke test for agent.llm.js — confirms your GEMINI_API_KEY
 * works and that Gemini correctly picks a tool given a realistic prompt.
 * Does NOT call your real backend or database — that wiring is step 4.
 *
 * Run from backend/: node test-agent-llm.js
 */

import { callAgentLLM } from "./src/modules/agent/agent.llm.js";

const userMessage = "book me a window seat to Chennai next Friday under ₹5000";

const contents = [
  { role: "user", parts: [{ text: userMessage }] }
];

const result = await callAgentLLM(contents);

console.log("=== functionCalls ===");
console.log(JSON.stringify(result.functionCalls, null, 2));

console.log("\n=== text ===");
console.log(result.text);

if (result.functionCalls.length === 0 && !result.text) {
  console.log("\n⚠️  No function call and no text — something's off, check the raw response below.");
  console.log(JSON.stringify(result.rawParts, null, 2));
}