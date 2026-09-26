import ApiResponse from "../../utils/ApiResponse.js";
import { runAgentChat } from "./agent.orchestrator.js";

export const chat = async (req, res, next) => {
  try {
    const { conversationId, message, confirm } = req.body;

    if (!message && confirm === undefined) {
      return res.status(400).json(new ApiResponse(false, "Provide either a message or a confirm flag."));
    }

    const ctx = { userId: req.user.id, role: req.user.role };

    const result = await runAgentChat(ctx, { conversationId, message, confirm });

    if (result.error === "NOT_FOUND") {
      return res.status(404).json(new ApiResponse(false, result.message));
    }
    if (result.error === "FORBIDDEN") {
      return res.status(403).json(new ApiResponse(false, result.message));
    }

    return res.status(200).json(
      new ApiResponse(true, "OK", {
        conversationId: result.conversationId,
        reply: result.reply,
        requiresConfirmation: result.requiresConfirmation,
        pendingAction: result.pendingAction
      })
    );
  } catch (err) {
    next(err);
  }
};