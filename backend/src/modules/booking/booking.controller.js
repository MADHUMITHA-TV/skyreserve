import { validationResult } from "express-validator";

import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import {
  createNewBooking,
  fetchMyBookings,
  fetchBookingById,
  lockFlightSeat,
  unlockFlightSeat,
  getSeatLockStatus,
  refreshSeatLock
} from "./booking.service.js";

export const create = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const booking = await createNewBooking(
    req.user.id,
    req.body
  );

  return res.status(201).json(
    new ApiResponse(
      true,
      "Booking created successfully",
      booking
    )
  );
});

export const findMyBookings = asyncHandler(async (req, res) => {
  const bookings = await fetchMyBookings(req.user.id);

  return res.status(200).json(
    new ApiResponse(
      true,
      "Bookings fetched successfully",
      bookings
    )
  );
});

export const findOne = asyncHandler(async (req, res) => {
  const booking = await fetchBookingById(req.params.id);

  return res.status(200).json(
    new ApiResponse(
      true,
      "Booking fetched successfully",
      booking
    )
  );
});

export const lockSeat = asyncHandler(
  async (req, res) => {
    const result = await lockFlightSeat(
      req.params.seatId,
      req.user.id
    );

    return res.status(200).json(
      new ApiResponse(
        true,
        result.message
      )
    );
  }
);

export const unlockSeat = asyncHandler(
  async (req, res) => {
    const result = await unlockFlightSeat(
      req.params.seatId,
      req.user.id
    );

    return res.status(200).json(
      new ApiResponse(
        true,
        result.message
      )
    );
  }
);

export const seatLockStatus = asyncHandler(
  async (req, res) => {
    const result = await getSeatLockStatus(
      req.params.seatId
    );

    return res.json(
      new ApiResponse(
        true,
        "Seat lock status",
        result
      )
    );
  }
);

export const refreshLock = asyncHandler(
  async (req, res) => {
    const result = await refreshSeatLock(
      req.params.seatId,
      req.user.id
    );

    return res.json(
      new ApiResponse(
        true,
        result.message
      )
    );
  }
);