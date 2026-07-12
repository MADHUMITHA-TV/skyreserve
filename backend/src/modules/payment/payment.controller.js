import { validationResult } from "express-validator";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import {
  createNewPayment,
  processPayment,
  refundPayment,
  fetchPaymentById,
  fetchPaymentByBookingId,
  fetchAllPayments
} from "./payment.service.js";

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

  const payment = await createNewPayment(
    bookingId,
    paymentMethod
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