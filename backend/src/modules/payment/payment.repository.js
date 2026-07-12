import prisma from "../../../prisma/client.js";

/**
 * Create a payment
 */
export const createPayment = async (paymentData, tx = prisma) => {
  return tx.payment.create({
    data: paymentData,
  });
};

/**
 * Find payment by ID
 */
export const findPaymentById = async (paymentId) => {
  return prisma.payment.findUnique({
    where: {
      id: paymentId,
    },
    include: {
      booking: {
        include: {
          flight: {
            include: {
              airline: true,
              departureAirport: true,
              arrivalAirport: true,
            },
          },
          passengers: true,
        },
      },
    },
  });
};

/**
 * Find payment using booking ID
 */
export const findPaymentByBookingId = async (bookingId) => {
  return prisma.payment.findUnique({
    where: {
      bookingId,
    },
    include: {
      booking: true,
    },
  });
};

/**
 * Update payment
 */
export const updatePayment = async (
  paymentId,
  paymentData,
  tx = prisma
) => {
  return tx.payment.update({
    where: {
      id: paymentId,
    },
    data: paymentData,
  });
};

/**
 * Delete payment (optional)
 */
export const deletePayment = async (
  paymentId,
  tx = prisma
) => {
  return tx.payment.delete({
    where: {
      id: paymentId,
    },
  });
};

/**
 * Get all payments (Admin)
 */
export const getAllPayments = async () => {
  return prisma.payment.findMany({
    include: {
      booking: {
        include: {
          flight: {
            include: {
              airline: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};