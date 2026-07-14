import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";

import {
  findSeats,
  findAvailableSeats
} from "./flightSeat.controller.js";

const router = Router();


/**
 * @swagger
 * /api/v1/flights/{flightId}/seats:
 *   get:
 *     summary: Get all seats for a flight
 *     tags:
 *       - Flight Seats
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: flightId
 *         required: true
 *         schema:
 *           type: string
 *         example: cmrez43vx0004ts5wu4yyu098
 *
 *     responses:
 *       200:
 *         description: Seats fetched successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       404:
 *         description: Flight not found
 */
router.get(
  "/:flightId/seats",
  authMiddleware,
  findSeats
);



/**
 * @swagger
 * /api/v1/flights/{flightId}/seats/available:
 *   get:
 *     summary: Get available seats for a flight
 *     tags:
 *       - Flight Seats
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: flightId
 *         required: true
 *         schema:
 *           type: string
 *         example: cmrez43vx0004ts5wu4yyu098
 *
 *     responses:
 *       200:
 *         description: Available seats fetched successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       404:
 *         description: Flight not found
 */
router.get(
  "/:flightId/seats/available",
  authMiddleware,
  findAvailableSeats
);


export default router;