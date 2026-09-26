import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";
import { chat } from "./agent.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Agent
 *   description: Conversational booking agent (Claude/Gemini tool-use over existing booking APIs)
 */

/**
 * @swagger
 * /api/v1/agent/chat:
 *   post:
 *     summary: Send a message to the booking agent
 *     tags: [Agent]
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversationId:
 *                 type: string
 *                 description: Omit on the first message of a new conversation.
 *               message:
 *                 type: string
 *                 example: book me a window seat to Chennai next Friday under ₹5000
 *               confirm:
 *                 type: boolean
 *                 description: Send true/false only when responding to a pending confirmation (e.g. before payment or cancellation).
 *
 *     responses:
 *       200:
 *         description: Agent reply
 *       400:
 *         description: Missing message/confirm
 *       403:
 *         description: Conversation belongs to a different user
 *       404:
 *         description: Conversation not found
 */
router.post("/chat", authMiddleware, chat);

export default router;