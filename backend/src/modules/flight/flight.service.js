import {
  createFlight,
  getFlights,
  getFlightById,
  updateFlight,
  deleteFlight
} from "./flight.repository.js";

export const addFlight = async (data) => {
  return createFlight(data);
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

  return updateFlight(id, data);
};

export const removeFlight = async (id) => {
  await fetchFlight(id);

  return deleteFlight(id);
};