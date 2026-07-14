import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";

import {
  create,
  findMyBookings,
  findOne,
  lockSeat,
  unlockSeat,
  seatLockStatus,
  refreshLock,
  cancel
} from "./booking.controller.js";

import { createBookingValidator } from "./booking.validator.js";


const router = Router();


/**
 * @swagger
 * tags:
 *   name: Booking
 *   description: Flight booking and seat locking APIs
 */


/**
 * @swagger
 * /api/v1/bookings:
 *   post:
 *     summary: Create a booking
 *     tags: [Booking]
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
 *               - flightId
 *               - seatId
 *               - passengers
 *
 *             properties:
 *               flightId:
 *                 type: string
 *                 example: cmflight123
 *
 *               seatId:
 *                 type: string
 *                 example: cmseat123
 *
 *               passengers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                       example: Madhu
 *
 *                     lastName:
 *                       type: string
 *                       example: TV
 *
 *                     age:
 *                       type: integer
 *                       example: 21
 *
 *                     gender:
 *                       type: string
 *                       example: FEMALE
 *
 *     responses:
 *       201:
 *         description: Booking created successfully
 *
 *       400:
 *         description: Validation error
 *
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authMiddleware,
  createBookingValidator,
  create
);



/**
 * @swagger
 * /api/v1/bookings:
 *   get:
 *     summary: Get logged-in user's bookings
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: User bookings fetched successfully
 *
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  authMiddleware,
  findMyBookings
);



/**
 * @swagger
 * /api/v1/bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: cmbooking123
 *
 *     responses:
 *       200:
 *         description: Booking details fetched successfully
 *
 *       404:
 *         description: Booking not found
 *
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/:id",
  authMiddleware,
  findOne
);



/**
 * @swagger
 * /api/v1/bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel booking
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: cmbooking123
 *
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *
 *       404:
 *         description: Booking not found
 *
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/:id/cancel",
  authMiddleware,
  cancel
);



/**
 * @swagger
 * /api/v1/bookings/lock/{seatId}:
 *   post:
 *     summary: Lock seat temporarily using Redis
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: seatId
 *         required: true
 *         schema:
 *           type: string
 *         example: cmseat123
 *
 *     responses:
 *       200:
 *         description: Seat locked successfully
 *
 *       409:
 *         description: Seat already locked
 *
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/lock/:seatId",
  authMiddleware,
  lockSeat
);



/**
 * @swagger
 * /api/v1/bookings/unlock/{seatId}:
 *   post:
 *     summary: Release Redis seat lock
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: seatId
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Seat unlocked successfully
 *
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/unlock/:seatId",
  authMiddleware,
  unlockSeat
);



/**
 * @swagger
 * /api/v1/bookings/lock/{seatId}:
 *   get:
 *     summary: Check seat lock status
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: seatId
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Lock status fetched successfully
 *
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/lock/:seatId",
  authMiddleware,
  seatLockStatus
);



/**
 * @swagger
 * /api/v1/bookings/lock/{seatId}:
 *   put:
 *     summary: Refresh seat lock TTL
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: seatId
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Lock refreshed successfully
 *
 *       404:
 *         description: Lock not found
 */
router.put(
  "/lock/:seatId",
  authMiddleware,
  refreshLock
);



export default router;