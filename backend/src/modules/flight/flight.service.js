import {
  createFlight,
  getFlights,
  getFlightById,
  updateFlight,
  deleteFlight,
  getFlightByNumber,
  getAirlineById,
  getAircraftById,
  getAirportById
} from "./flight.repository.js";
import { generateSeatsForFlight } from "../flightSeat/flightSeat.service.js";
export const addFlight = async (flightData) => {
  const existingFlight = await getFlightByNumber(
    flightData.flightNumber
  );

  if (existingFlight) {
    throw new Error("Flight number already exists");
  }

  const flight = await createFlight(flightData);

  await generateSeatsForFlight(
    flight.id,
    flight.aircraft.totalSeats
  );

  return await fetchFlight(flight.id);
};
export const fetchFlights = async () => {
  return getFlights();
};

export const fetchFlight = async (id) => {
  const flight = await getFlightById(id);

  if (!flight) {
    throw new Error("Flight not found");
  }

  return flight;
};

export const editFlight = async (id, data) => {
  await fetchFlight(id);

  if (
    data.departureAirportId &&
    data.arrivalAirportId &&
    data.departureAirportId === data.arrivalAirportId
  ) {
    throw new Error(
      "Departure and arrival airports cannot be the same"
    );
  }

  if (
    data.departureTime &&
    data.arrivalTime &&
    new Date(data.arrivalTime) <= new Date(data.departureTime)
  ) {
    throw new Error(
      "Arrival time must be after departure time"
    );
  }

  return updateFlight(id, data);
};

export const removeFlight = async (id) => {
  await fetchFlight(id);

  return deleteFlight(id);
};

