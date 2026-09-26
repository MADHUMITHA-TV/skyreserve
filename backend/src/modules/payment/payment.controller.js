import { validationResult } from "express-validator";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import {
  createNewPayment,
  processPayment,
  failPayment,
  refundPayment,
  fetchPaymentById,
  fetchPaymentByBookingId,
  fetchAllPayments
} from "./payment.service.js";

import { fetchBookingById } from "../booking/booking.service.js";

/** Throws-free ownership check helper — returns true if allowed. Kept
 * local to this controller since payment.service.js itself does not
 * check ownership (see docs/AI_FEATURES.md, "Known gaps"). */
function isOwnerOrAdmin(booking, user) {
  return booking.userId === user.id || user.role === "ADMIN";
}

/**
 * Create Payment
 */
export const create = asyncHandler(async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { bookingId, paymentMethod } = req.body;

  const booking = await fetchBookingById(bookingId);
  if (!isOwnerOrAdmin(booking, req.user)) {
    return res.status(403).json(
      new ApiResponse(false, "This booking does not belong to you")
    );
  }

  const idempotencyKey =
  req.headers["idempotency-key"];

  const payment = await createNewPayment(
    bookingId,
    paymentMethod,
    idempotencyKey
  );

  return res.status(201).json(
    new ApiResponse(
      true,
      "Payment created successfully",
      payment
    )
  );

});

/**
 * Complete Payment
 */
export const pay = asyncHandler(async (req, res) => {

  const { transactionId } = req.body;

  const existingPayment = await fetchPaymentById(req.params.id);
  const booking = await fetchBookingById(existingPayment.bookingId);
  if (!isOwnerOrAdmin(booking, req.user)) {
    return res.status(403).json(
      new ApiResponse(false, "This payment does not belong to you")
    );
  }

  const payment = await processPayment(
    req.params.id,
    transactionId
  );

  return res.status(200).json(
    new ApiResponse(
      true,
      "Payment successful",
      payment
    )
  );

});

/**
 * Refund Payment
 */
export const refund = asyncHandler(async (req, res) => {

  const existingPayment = await fetchPaymentById(req.params.id);
  const booking = await fetchBookingById(existingPayment.bookingId);
  if (!isOwnerOrAdmin(booking, req.user)) {
    return res.status(403).json(
      new ApiResponse(false, "This payment does not belong to you")
    );
  }

  const payment = await refundPayment(
    req.params.id
  );

  return res.status(200).json(
    new ApiResponse(
      true,
      "Refund processed successfully",
      payment
    )
  );

});

/**
 * Get Payment by ID
 */
export const findOne = asyncHandler(async (req, res) => {

  const payment = await fetchPaymentById(
    req.params.id
  );

  const booking = await fetchBookingById(payment.bookingId);
  if (!isOwnerOrAdmin(booking, req.user)) {
    return res.status(403).json(
      new ApiResponse(false, "This payment does not belong to you")
    );
  }

  return res.status(200).json(
    new ApiResponse(
      true,
      "Payment fetched successfully",
      payment
    )
  );

});

/**
 * Get Payment using Booking ID
 */
export const findByBooking = asyncHandler(async (req, res) => {

  const booking = await fetchBookingById(req.params.bookingId);
  if (!isOwnerOrAdmin(booking, req.user)) {
    return res.status(403).json(
      new ApiResponse(false, "This booking does not belong to you")
    );
  }

  const payment =
    await fetchPaymentByBookingId(
      req.params.bookingId
    );

  return res.status(200).json(
    new ApiResponse(
      true,
      "Payment fetched successfully",
      payment
    )
  );

});

/**
 * Admin - Get All Payments
 */
export const findAll = asyncHandler(async (req, res) => {

  const payments = await fetchAllPayments();

  return res.status(200).json(
    new ApiResponse(
      true,
      "Payments fetched successfully",
      payments
    )
  );

});