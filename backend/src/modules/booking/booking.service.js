import {
  findFlightById,
  findSeatById,
  createBooking,
  createBookingPassengers,
  updateSeatBooking,
  getBookingById,
  getBookingsByUserId,
  cancelBookingTransaction,
  getBookingWithUser
} from "./booking.repository.js";

import prisma from "../../config/database.js";
import ApiError from "../../utils/ApiError.js";

import {
  lockSeat,
  unlockSeat,
  getSeatLockOwner,
  getSeatLockTTL,
  extendSeatLock
} from "../../utils/redisLock.js";
import { getSeatById } from "../flightSeat/flightSeat.repository.js";
import { retry } from "../../utils/retry.js";

const generateBookingCode = () => {
  return (
    "BK" +
    Date.now().toString().slice(-8) +
    Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
  );
};

export const createNewBooking = async (
  userId,
  bookingData
) => {
  const {
  flightId,
  seatId,
  passengers
} = bookingData;

  const flight = await findFlightById(flightId);

  const seat = await findSeatById(seatId);

if (!seat) {
  throw new ApiError(404, "Seat not found");
}

if (seat.flightId !== flightId) {
  throw new ApiError(
    400,
    "Seat does not belong to this flight"
  );
}

if (seat.status !== "AVAILABLE") {
  throw new ApiError(
    400,
    "Seat is not available"
  );
}

if (seat.status === "BOOKED") {
  throw new ApiError(
    409,
    "Seat is already booked"
  );
}

  if (!flight) {
    throw new ApiError(404, "Flight not found");
  }

  if (flight.status === "CANCELLED") {
    throw new ApiError(400, "Flight is cancelled");
  }

  if (!passengers || passengers.length === 0) {
    throw new ApiError(
      400,
      "At least one passenger is required"
    );
  }

  if (passengers.length > 9) {
    throw new ApiError(
      400,
      "Maximum 9 passengers allowed"
    );
  }

  const totalAmount = passengers.length * 5000;

  try {
    const booking = await prisma.$transaction(
      async (tx) => {
        const newBooking =
          await createBooking(
            {
              bookingCode:
                generateBookingCode(),
              status: "PENDING",
              totalAmount,
              userId,
              flightId
            },
            tx
          );

        const passengerData =
          passengers.map((passenger) => ({
            ...passenger,
            bookingId: newBooking.id
          }));

        await createBookingPassengers(
          passengerData,
          tx
        );
        

        await updateSeatBooking(
  seatId,
  newBooking.id,
  tx
);

        // Uncomment ONLY while testing rollback
        //throw new Error("Rollback Test");

        return newBooking;
      }
    );

    return await getBookingById(booking.id);
  } catch (error) {
    console.error(
      "Booking transaction failed:",
      error.message
    );

    throw new ApiError(
      500,
      "Booking creation failed. Transaction rolled back."
    );
  }
};

export const fetchMyBookings = async (userId) => {
  return await getBookingsByUserId(userId);
};

export const fetchBookingById = async (bookingId) => {
  const booking = await getBookingById(bookingId);

  if (!booking) {
    throw new ApiError(
      404,
      "Booking not found"
    );
  }

  return booking;
};

export const lockFlightSeat = async (
  seatId,
  userId
) => {
  const lock = await lockSeat(
    seatId,
    userId
  );

  if (!lock) {
    throw new ApiError(
      409,
      "Seat is already locked"
    );
  }

  return {
    message: "Seat locked successfully",
    token: lock.token
  };
};

export const unlockFlightSeat = async (
  seatId,
  userId
) => {
  const owner = await getSeatLockOwner(
    seatId
  );

  if (!owner) {
    throw new ApiError(
      404,
      "Seat is not locked"
    );
  }

  if (owner.userId !== userId) {
    throw new ApiError(
      403,
      "You do not own this seat lock"
    );
  }

  await retry(async () => {
  await unlockSeat(
    seatId,
    owner.token
  );
});

  return {
    message: "Seat unlocked successfully"
  };
};

export const getSeatLockStatus = async (
  seatId
) => {
  const owner =
    await getSeatLockOwner(seatId);

  if (!owner) {
    return {
      locked: false,
      owner: null,
      token: null,
      ttl: 0
    };
  }

  return {
    locked: true,
    owner: owner.userId,
    token: owner.token,
    ttl: await getSeatLockTTL(seatId)
  };
};

export const refreshSeatLock = async (
  seatId,
  userId
) => {
  const owner =
    await getSeatLockOwner(seatId);

  if (!owner) {
    throw new ApiError(
      404,
      "Seat lock not found"
    );
  }

  if (owner.userId !== userId) {
    throw new ApiError(
      403,
      "You do not own this seat lock"
    );
  }

  await extendSeatLock(seatId);

  return {
    message: "Seat lock refreshed"
  };
};

export const cancelBooking = async (
  bookingId,
  user
) => {
  const booking =
    await getBookingWithUser(bookingId);

  if (!booking) {
    throw new ApiError(
      404,
      "Booking not found"
    );
  }

  if (
    user.role !== "ADMIN" &&
    booking.userId !== user.id
  ) {
    throw new ApiError(
      403,
      "You are not authorized to cancel this booking"
    );
  }

  if (booking.status === "CANCELLED") {
    throw new ApiError(
      400,
      "Booking is already cancelled"
    );
  }

  return await cancelBookingTransaction(
    bookingId
  );
};