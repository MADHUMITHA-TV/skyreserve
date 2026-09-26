/**
 * policy.retriever.js
 *
 * Retrieval half of RAG. Embeds the incoming question with the same
 * local model used at ingestion time (embedPolicies.js), then ranks
 * every stored chunk by cosine similarity. Brute-force over ~20 chunks
 * is sub-millisecond — no vector DB needed at this corpus size.
 */

import prisma from "../../config/database.js";
import { embedText, cosineSimilarity } from "./embedding.js";

/**
 * @param {string} query
 * @param {number} topK - how many chunks to return, ranked best-first
 * @returns {Promise<Array<{id, source, sectionTitle, content, score}>>}
 */
export async function retrieveRelevantChunks(query, topK = 4) {
  const queryEmbedding = await embedText(query);

  const allChunks = await prisma.policyChunk.findMany({
    select: { id: true, source: true, sectionTitle: true, content: true, embedding: true }
  });

  const scored = allChunks.map((chunk) => ({
    id: chunk.id,
    source: chunk.source,
    sectionTitle: chunk.sectionTitle,
    content: chunk.content,
    score: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}