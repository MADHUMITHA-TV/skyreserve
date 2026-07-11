import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

import {
  fetchSeatsByFlight,
  fetchAvailableSeats
} from "./flightSeat.service.js";

export const findSeats = asyncHandler(async (req, res) => {
  const seats = await fetchSeatsByFlight(
    req.params.flightId
  );

  return res.status(200).json(
    new ApiResponse(
      true,
      "Seats fetched successfully",
      seats
    )
  );
});

export const findAvailableSeats = asyncHandler(async (req, res) => {
  const seats = await fetchAvailableSeats(
    req.params.flightId
  );

  return res.status(200).json(
    new ApiResponse(
      true,
      "Available seats fetched successfully",
      seats
    )
  );
});