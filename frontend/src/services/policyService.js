import api from "../api/axios";

// POST /support/chat - RAG-based policy support (baggage/cancellation/refund).
// Stateless per question — no conversationId, unlike the booking agent.
export async function askPolicyQuestion(question) {
  const { data } = await api.post("/support/chat", { question });
  return data.data;
  // -> { answer, sources: [{ source, sectionTitle, relevance }] }
}