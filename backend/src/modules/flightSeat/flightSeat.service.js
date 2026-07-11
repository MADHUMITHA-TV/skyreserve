import {
  createManySeats,
  getSeatsByFlightId,
  getAvailableSeatsByFlightId
} from "./flightSeat.repository.js";

import ApiError from "../../utils/ApiError.js";

const SEAT_COLUMNS = ["A", "B", "C", "D", "E", "F"];

export const generateSeatsForFlight = async (
  flightId,
  totalSeats
) => {
  console.log("Generating seats for flight:", flightId);
  console.log("Total seats:", totalSeats);

  const rows = Math.ceil(totalSeats / SEAT_COLUMNS.length);

  const seats = [];

  for (let row = 1; row <= rows; row++) {
    for (const column of SEAT_COLUMNS) {
      if (seats.length === totalSeats) break;

      seats.push({
        flightId,
        seatNumber: `${row}${column}`,
        status: "AVAILABLE"
      });
    }
  }

  console.log("Seats prepared:", seats.length);

  await createManySeats(seats);

  console.log("Seats inserted into database.");

  return seats.length;
};
export const fetchSeatsByFlight = async (flightId) => {
  return await getSeatsByFlightId(flightId);
};

export const fetchAvailableSeats = async (flightId) => {
  return await getAvailableSeatsByFlightId(flightId);
};