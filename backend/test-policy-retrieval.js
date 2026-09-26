/**
 * test-policy-retrieval.js
 *
 * Tests retrieval only — embeds a question locally and ranks stored
 * chunks by similarity. No Gemini call, so this works regardless of
 * your API quota.
 *
 * Run from backend/: node test-policy-retrieval.js
 */

import { retrieveRelevantChunks } from "./src/modules/policy/policy.retriever.js";

const questions = [
  "Can I carry a power bank in my checked baggage?",
  "How much do I get back if I cancel two days before my flight?",
  "How long does a refund take for a duplicate payment?"
];

for (const q of questions) {
  console.log(`\nQ: ${q}`);
  const results = await retrieveRelevantChunks(q, 3);
  results.forEach((r, i) => {
    console.log(`  ${i + 1}. [${r.score.toFixed(3)}] ${r.source} — ${r.sectionTitle}`);
  });
}

process.exit(0);