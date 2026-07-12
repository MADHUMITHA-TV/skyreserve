import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";

import {
  create,
  pay,
  refund,
  findOne,
  findByBooking,
  findAll
} from "./payment.controller.js";

import {
  createPaymentValidator,
  payValidator
} from "./payment.validator.js";

const router = Router();

/**
 * Create Payment
 */
router.post(
  "/",
  authMiddleware,
  createPaymentValidator,
  create
);

/**
 * Complete Payment
 */
router.post(
  "/:id/pay",
  authMiddleware,
  payValidator,
  pay
);

/**
 * Refund Payment
 */
router.post(
  "/:id/refund",
  authMiddleware,
  refund
);

/**
 * Get Payment by Booking ID
 *
 * IMPORTANT:
 * Keep this route BEFORE "/:id"
 */
router.get(
  "/booking/:bookingId",
  authMiddleware,
  findByBooking
);

/**
 * Get Payment by ID
 */
router.get(
  "/:id",
  authMiddleware,
  findOne
);

/**
 * Get All Payments (Admin)
 *
 * Later you can replace authMiddleware with:
 *
 * authMiddleware,
 * adminMiddleware
 */
router.get(
  "/",
  authMiddleware,
  findAll
);

export default router;