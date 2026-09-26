import api from "../api/axios";

// POST /agent/chat - conversational booking agent.
// Send either `message` (free text) or `confirm` (true/false) to answer
// a pending confirmation (e.g. before payment or cancellation) — never
// both at once. See backend agent.orchestrator.js for why confirmation
// is a structured flag rather than parsed from chat text.
export async function sendAgentMessage({ conversationId, message, confirm }) {
  const { data } = await api.post("/agent/chat", {
    ...(conversationId ? { conversationId } : {}),
    ...(message !== undefined ? { message } : {}),
    ...(confirm !== undefined ? { confirm } : {}),
  });
  return data.data;
  // -> { conversationId, reply, requiresConfirmation, pendingAction }
}