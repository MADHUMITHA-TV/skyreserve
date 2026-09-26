/**
 * embedding.js
 *
 * Local, free, no-API-key text embeddings via transformers.js running
 * Xenova/all-MiniLM-L6-v2 entirely on CPU. The model (~23MB) downloads
 * once and is cached locally afterward — no network calls on subsequent
 * runs, no Gemini quota consumed, no cost ever.
 *
 * Shared by scripts/embedPolicies.js (ingestion) and
 * agent.retriever.js (query time) so both sides always use the exact
 * same model — embeddings from different models aren't comparable.
 */

import { pipeline } from "@huggingface/transformers";

let extractorPromise = null;

function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return extractorPromise;
}

/** @param {string} text @returns {Promise<number[]>} 384-dim vector */
export async function embedText(text) {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

/** @param {number[]} a @param {number[]} b */
export function cosineSimilarity(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  // Vectors are already normalized (normalize: true above), so cosine
  // similarity is just the dot product — no need to divide by magnitudes.
  return dot;
}