import prisma from "../../config/database.js";

import ApiError from "../../utils/ApiError.js";

import {
  createPayment,
  findPaymentById,
  findPaymentByBookingId,
  updatePayment,
  getAllPayments
} from "./payment.repository.js";

import { getBookingById } from "../booking/booking.repository.js";
import { unlockSeat } from "../../utils/redisLock.js";
/**
 * Create Payment
 */
export const createNewPayment = async (
  bookingId,
  paymentMethod
) => {

  const booking = await getBookingById(bookingId);

  if (!booking) {
    throw new ApiError(
      404,
      "Booking not found"
    );
  }

  if (booking.status === "CANCELLED") {
    throw new ApiError(
      400,
      "Cannot pay for cancelled booking"
    );
  }

  if (booking.status === "CONFIRMED") {
    throw new ApiError(
      400,
      "Booking is already confirmed"
    );
  }

  const existingPayment =
    await findPaymentByBookingId(
      bookingId
    );

  if (existingPayment) {
    throw new ApiError(
      409,
      "Payment already exists for this booking"
    );
  }

  const payment =
    await createPayment({
      bookingId,
      amount: booking.totalAmount,
      paymentMethod,
      status: "PENDING"
    });

  return payment;
};


/**
 * Make Payment
 */
export const processPayment = async (
  paymentId,
  transactionId
) => {

  const payment =
    await findPaymentById(paymentId);

  if (!payment) {
    throw new ApiError(
      404,
      "Payment not found"
    );
  }

  if (payment.status === "SUCCESS") {
    throw new ApiError(
      400,
      "Payment already completed"
    );
  }

  if (payment.status === "REFUNDED") {
    throw new ApiError(
      400,
      "Payment already refunded"
    );
  }

  const booking =
    await getBookingById(
      payment.bookingId
    );

  if (!booking) {
    throw new ApiError(
      404,
      "Booking not found"
    );
  }

  const result =
    await prisma.$transaction(
      async (tx) => {

        // Update payment
        const updatedPayment =
          await updatePayment(
            paymentId,
            {
              status: "SUCCESS",
              transactionId,
              paidAt: new Date()
            },
            tx
          );

        // Confirm booking
        await tx.booking.update({
          where: {
            id: payment.bookingId
          },
          data: {
            status: "CONFIRMED"
          }
        });

        const seat = await tx.flightSeat.findFirst({
    where:{
        bookingId: payment.bookingId
    }
});

if(seat){

    await tx.flightSeat.update({
        where:{
            id: seat.id
        },
        data:{
            status:"BOOKED"
        }
    });

}

        // Book all seats belonging to booking
        await tx.flightSeat.updateMany({
  where: {
    bookingId: payment.bookingId
  },
  data: {
    status: "BOOKED"
  }
});

/*
 * Immediately release Redis seat lock
 * after successful payment.
 */

const bookedSeats =
  await tx.flightSeat.findMany({
    where: {
      bookingId: payment.bookingId
    }
  });

for (const seat of bookedSeats) {
  await unlockSeat(seat.id);
}

return updatedPayment;
      }
    );

  return result;
};


/**
 * Payment Failed
 * (optional endpoint)
 */
export const failPayment = async (
  paymentId
) => {

  const payment =
    await findPaymentById(paymentId);

  if (!payment) {
    throw new ApiError(
      404,
      "Payment not found"
    );
  }

  if (payment.status !== "PENDING") {
    throw new ApiError(
      400,
      "Only pending payments can fail"
    );
  }

  const result =
    await prisma.$transaction(
      async (tx) => {

        const updatedPayment =
          await updatePayment(
            paymentId,
            {
              status: "FAILED"
            },
            tx
          );

        await tx.booking.update({
          where: {
            id: payment.bookingId
          },
          data: {
            status: "CANCELLED"
          }
        });

        await tx.flightSeat.updateMany({
          where: {
            bookingId: payment.bookingId
          },
          data: {
            bookingId: null,
            status: "AVAILABLE"
          }
        });

        return updatedPayment;
      }
    );

  return result;
};


/**
 * Refund Payment
 */
export const refundPayment = async (
  paymentId
) => {

  const payment =
    await findPaymentById(paymentId);

  if (!payment) {
    throw new ApiError(
      404,
      "Payment not found"
    );
  }

  if (payment.status !== "SUCCESS") {
    throw new ApiError(
      400,
      "Only successful payments can be refunded"
    );
  }

  const result =
  await prisma.$transaction(
    async (tx) => {

      const updatedPayment =
        await updatePayment(
          paymentId,
          {
            status: "REFUNDED"
          },
          tx
        );

      await tx.booking.update({
        where: {
          id: payment.bookingId
        },
        data: {
          status: "CANCELLED"
        }
      });

      // Find booked seat
      const seat = await tx.flightSeat.findFirst({
        where: {
          bookingId: payment.bookingId
        }
      });

      // Release seat
      if (seat) {
        await tx.flightSeat.update({
          where: {
            id: seat.id
          },
          data: {
            bookingId: null,
            status: "AVAILABLE"
          }
        });
      }

      return updatedPayment;
    }
  );

  return result;
};


/**
 * Get Payment
 */
export const fetchPaymentById = async (
  paymentId
) => {

  const payment =
    await findPaymentById(paymentId);

  if (!payment) {
    throw new ApiError(
      404,
      "Payment not found"
    );
  }

  return payment;
};


/**
 * Get Payment by Booking
 */
export const fetchPaymentByBookingId =
async (bookingId) => {

  const payment =
    await findPaymentByBookingId(
      bookingId
    );

  if (!payment) {
    throw new ApiError(
      404,
      "Payment not found"
    );
  }

  return payment;
};


/**
 * Admin
 */
export const fetchAllPayments =
async () => {

  return await getAllPayments();

};