import prisma from "../../config/database.js";

export const createManySeats = async (seats) => {
  return prisma.flightSeat.createMany({
    data: seats
  });
};

export const getSeatsByFlightId = async (flightId) => {
  return prisma.flightSeat.findMany({
    where: {
      flightId
    },
    orderBy: {
      seatNumber: "asc"
    }
  });
};

export const getAvailableSeatsByFlightId = async (flightId) => {
  return prisma.flightSeat.findMany({
    where: {
      flightId,
      status: "AVAILABLE"
    },
    orderBy: {
      seatNumber: "asc"
    }
  });
};

export const getSeatByFlightAndNumber = async (
  flightId,
  seatNumber
) => {
  return prisma.flightSeat.findUnique({
    where: {
      flightId_seatNumber: {
        flightId,
        seatNumber
      }
    }
  });
};

// NEW
export const getSeatById = async (seatId) => {
  return prisma.flightSeat.findUnique({
    where: {
      id: seatId
    }
  });
};

// Updated
export const updateSeatStatus = async (
  id,
  status,
  bookingId = null
) => {
  return prisma.flightSeat.update({
    where: {
      id
    },
    data: {
      status,
      bookingId
    }
  });
};