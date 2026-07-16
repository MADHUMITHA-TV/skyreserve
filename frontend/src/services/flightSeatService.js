import api from "../api/axios";

// GET /flights/:flightId/seats - full seat map (AVAILABLE / LOCKED / BOOKED)
export async function getSeatsByFlight(flightId) {
  const { data } = await api.get(`/flights/${flightId}/seats`);
  return data.data;
}

// GET /flights/:flightId/seats/available
export async function getAvailableSeats(flightId) {
  const { data } = await api.get(`/flights/${flightId}/seats/available`);
  return data.data;
}
