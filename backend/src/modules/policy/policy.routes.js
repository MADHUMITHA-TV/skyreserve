import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";
import { ask } from "./policy.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: PolicySupport
 *   description: RAG-based support chatbot over baggage/cancellation/refund policy
 */

/**
 * @swagger
 * /api/v1/support/chat:
 *   post:
 *     summary: Ask a policy question (baggage, cancellation, refund)
 *     tags: [PolicySupport]
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *             properties:
 *               question:
 *                 type: string
 *                 example: Can I carry a power bank in my checked baggage?
 *
 *     responses:
 *       200:
 *         description: Answer grounded in retrieved policy excerpts
 *       400:
 *         description: Missing question
 */
router.post("/chat", authMiddleware, ask);

export default router;