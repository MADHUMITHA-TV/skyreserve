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
    const err = new Error("Flight number already exists");
    err.statusCode = 400;
    throw err;
  }

  const airline = await getAirlineById(flightData.airlineId);
  if (!airline) {
    const err = new Error("Airline not found");
    err.statusCode = 404;
    throw err;
  }

  const aircraft = await getAircraftById(flightData.aircraftId);
  if (!aircraft) {
    const err = new Error("Aircraft not found");
    err.statusCode = 404;
    throw err;
  }

  const departureAirport = await getAirportById(
    flightData.departureAirportId
  );

  if (!departureAirport) {
    const err = new Error("Departure airport not found");
    err.statusCode = 404;
    throw err;
  }

  const arrivalAirport = await getAirportById(
    flightData.arrivalAirportId
  );

  if (!arrivalAirport) {
    const err = new Error("Arrival airport not found");
    err.statusCode = 404;
    throw err;
  }

  if (
    flightData.departureAirportId ===
    flightData.arrivalAirportId
  ) {
    const err = new Error(
      "Departure and arrival airports cannot be the same"
    );
    err.statusCode = 400;
    throw err;
  }

  if (
    new Date(flightData.arrivalTime) <=
    new Date(flightData.departureTime)
  ) {
    const err = new Error(
      "Arrival time must be after departure time"
    );
    err.statusCode = 400;
    throw err;
  }

  const flight = await createFlight(flightData);

  await generateSeatsForFlight(
    flight.id,
    aircraft.totalSeats
  );

  return await fetchFlight(flight.id);
};
  

export const editFlight = async (id, data) => {
  const existingFlight = await fetchFlight(id);

  const departureAirportId =
    data.departureAirportId ?? existingFlight.departureAirportId;

  const arrivalAirportId =
    data.arrivalAirportId ?? existingFlight.arrivalAirportId;

  if (departureAirportId === arrivalAirportId) {
    const err = new Error(
      "Departure and arrival airports cannot be the same"
    );
    err.statusCode = 400;
    throw err;
  }

  const departureTime =
    data.departureTime ?? existingFlight.departureTime;

  const arrivalTime =
    data.arrivalTime ?? existingFlight.arrivalTime;

  if (
    new Date(arrivalTime) <=
    new Date(departureTime)
  ) {
    const err = new Error(
      "Arrival time must be after departure time"
    );
    err.statusCode = 400;
    throw err;
  }

  return updateFlight(id, data);
};

export const fetchFlights = async (filters) => {
  return getFlights(filters);
};

export const fetchFlight = async (id) => {
  const flight = await getFlightById(id);

  if (!flight) {
    const err = new Error("Flight not found");
    err.statusCode = 404;
    throw err;
  }

  return flight;
};

export const removeFlight = async (id) => {
  await fetchFlight(id);

  return deleteFlight(id);
};

