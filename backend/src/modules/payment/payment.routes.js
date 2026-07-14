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
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment processing and refund APIs
 */


/**
 * @swagger
 * /api/v1/payments:
 *   post:
 *     summary: Create a payment request
 *     tags: [Payment]
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
 *               - bookingId
 *               - paymentMethod
 *
 *             properties:
 *               bookingId:
 *                 type: string
 *                 example: cmbooking123
 *
 *               paymentMethod:
 *                 type: string
 *                 example: UPI
 *
 *     responses:
 *       201:
 *         description: Payment created successfully
 *
 *       400:
 *         description: Validation error
 *
 *       401:
 *         description: Unauthorized
 *
 *       409:
 *         description: Payment already exists
 */
router.post(
  "/",
  authMiddleware,
  createPaymentValidator,
  create
);




/**
 * @swagger
 * /api/v1/payments/{id}/pay:
 *   post:
 *     summary: Complete payment transaction
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: cmpayment123
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *
 *             required:
 *               - transactionId
 *
 *             properties:
 *               transactionId:
 *                 type: string
 *                 example: TXN999999
 *
 *     responses:
 *       200:
 *         description: Payment completed successfully
 *
 *       400:
 *         description: Invalid payment data
 *
 *       404:
 *         description: Payment not found
 *
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/:id/pay",
  authMiddleware,
  payValidator,
  pay
);




/**
 * @swagger
 * /api/v1/payments/{id}/refund:
 *   post:
 *     summary: Refund a successful payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: cmpayment123
 *
 *     responses:
 *       200:
 *         description: Payment refunded successfully
 *
 *       400:
 *         description: Refund failed
 *
 *       404:
 *         description: Payment not found
 *
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/:id/refund",
  authMiddleware,
  refund
);




/**
 * @swagger
 * /api/v1/payments/booking/{bookingId}:
 *   get:
 *     summary: Get payment details by booking ID
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         example: cmbooking123
 *
 *     responses:
 *       200:
 *         description: Payment details fetched successfully
 *
 *       404:
 *         description: Payment not found
 *
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/booking/:bookingId",
  authMiddleware,
  findByBooking
);




/**
 * @swagger
 * /api/v1/payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: cmpayment123
 *
 *     responses:
 *       200:
 *         description: Payment fetched successfully
 *
 *       404:
 *         description: Payment not found
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
 * /api/v1/payments:
 *   get:
 *     summary: Get all payments
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: All payments fetched successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden
 */
router.get(
  "/",
  authMiddleware,
  findAll
);



export default router;