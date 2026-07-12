import prisma from "../../../prisma/client.js";

export const findFlightById = async (flightId) => {
  return prisma.flight.findUnique({
    where: {
      id: flightId
    },
    include: {
      airline: true,
      aircraft: true,
      departureAirport: true,
      arrivalAirport: true
    }
  });
};

export const createBooking = async (
  bookingData,
  tx = prisma
) => {
  return tx.booking.create({
    data: bookingData
  });
};

export const createBookingPassengers = async (
  passengers,
  tx = prisma
) => {
  return tx.bookingPassenger.createMany({
    data: passengers
  });
};

export const getBookingById = async (bookingId) => {
  return prisma.booking.findUnique({
    where: {
      id: bookingId
    },
    include: {
      flight: {
        include: {
          airline: true,
          departureAirport: true,
          arrivalAirport: true
        }
      },
      passengers: true,
      payment: true
    }
  });
};

export const getBookingsByUserId = async (userId) => {
  return prisma.booking.findMany({
    where: {
      userId
    },
    include: {
      flight: {
        include: {
          airline: true,
          departureAirport: true,
          arrivalAirport: true
        }
      },
      passengers: true,
      payment: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
};

export const findSeatById = async (seatId) => {
  return prisma.flightSeat.findUnique({
    where: {
      id: seatId
    }
  });
};

export const updateSeatBooking = async (
  seatId,
  bookingId,
  tx = prisma
) => {
  return tx.flightSeat.update({
    where: {
      id: seatId
    },
    data: {
      bookingId,
      status: "LOCKED"
    }
  });
};
export const cancelBookingTransaction = async (bookingId) => {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.update({
      where: {
        id: bookingId
      },
      data: {
        status: "CANCELLED"
      }
    });

    await tx.flightSeat.updateMany({
      where: {
        bookingId
      },
      data: {
        status: "AVAILABLE",
        bookingId: null
      }
    });

    return booking;
  });
};

export const getBookingWithUser = async (bookingId) => {
  return prisma.booking.findUnique({
    where: {
      id: bookingId
    }
  });
};

export const updateBookingStatus = async (
  bookingId,
  status,
  tx = prisma
) => {
  return tx.booking.update({
    where: {
      id: bookingId
    },
    data: {
      status
    }
  });
};

export const getBookingWithSeat = async (
  bookingId
) => {
  return prisma.booking.findUnique({
    where: {
      id: bookingId
    },
    include: {
      flight: true,
      payment: true
    }
  });
};