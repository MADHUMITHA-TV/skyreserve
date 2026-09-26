import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";
import { getSummary } from "./summary.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: BookingSummary
 *   description: LLM-generated human-readable booking confirmations (data-to-text)
 */

/**
 * @swagger
 * /api/v1/bookings-summary/{id}:
 *   get:
 *     summary: Generate a human-readable confirmation summary for a booking
 *     tags: [BookingSummary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Generated summary text plus the structured data it was built from
 *       403:
 *         description: Booking belongs to a different user
 *       404:
 *         description: Booking not found
 */
router.get("/:id", authMiddleware, getSummary);

export default router;