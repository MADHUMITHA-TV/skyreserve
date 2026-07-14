import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";
import authorizeRoles from "../../middleware/role.middleware.js";

import {
  create,
  findAll,
  findOne,
  update,
  remove
} from "./flight.controller.js";

import { flightValidator } from "./flight.validator.js";

const router = Router();


/**
 * @swagger
 * tags:
 *   name: Flights
 *   description: Flight management APIs
 */


/**
 * @swagger
 * /api/v1/flights:
 *   post:
 *     summary: Create a new flight
 *     tags: [Flights]
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
 *               - flightNumber
 *               - departureTime
 *               - arrivalTime
 *               - airlineId
 *               - aircraftId
 *               - departureAirportId
 *               - arrivalAirportId
 *
 *             properties:
 *               flightNumber:
 *                 type: string
 *                 example: AI105
 *
 *               departureTime:
 *                 type: string
 *                 example: 2026-08-24T09:00:00Z
 *
 *               arrivalTime:
 *                 type: string
 *                 example: 2026-08-24T11:30:00Z
 *
 *               airlineId:
 *                 type: string
 *                 example: cm123airline
 *
 *               aircraftId:
 *                 type: string
 *                 example: cm123aircraft
 *
 *               departureAirportId:
 *                 type: string
 *                 example: cm123airport
 *
 *               arrivalAirportId:
 *                 type: string
 *                 example: cm456airport
 *
 *     responses:
 *       201:
 *         description: Flight created successfully
 *
 *       400:
 *         description: Validation error
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Admin access required
 */
router.post(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN"),
  flightValidator,
  create
);


/**
 * @swagger
 * /api/v1/flights:
 *   get:
 *     summary: Get all flights
 *     tags: [Flights]
 *
 *     responses:
 *       200:
 *         description: Flights fetched successfully
 */
router.get("/", findAll);


/**
 * @swagger
 * /api/v1/flights/{id}:
 *   get:
 *     summary: Get flight by ID
 *     tags: [Flights]
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: cmflight123
 *
 *     responses:
 *       200:
 *         description: Flight fetched successfully
 *
 *       404:
 *         description: Flight not found
 */
router.get("/:id", findOne);



/**
 * @swagger
 * /api/v1/flights/{id}:
 *   put:
 *     summary: Update flight
 *     tags: [Flights]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: cmflight123
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               status: DELAYED
 *
 *     responses:
 *       200:
 *         description: Flight updated successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Admin access required
 *
 *       404:
 *         description: Flight not found
 */
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  update
);



/**
 * @swagger
 * /api/v1/flights/{id}:
 *   delete:
 *     summary: Delete flight
 *     tags: [Flights]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: cmflight123
 *
 *     responses:
 *       200:
 *         description: Flight deleted successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Admin access required
 *
 *       404:
 *         description: Flight not found
 */
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  remove
);


export default router;