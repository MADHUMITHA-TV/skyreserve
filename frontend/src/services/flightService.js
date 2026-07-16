import api from "../api/axios";

// GET /flights?airlineId=&departureAirportId=&arrivalAirportId=&date=
export async function getFlights(filters = {}) {
  const params = {};

  if (filters.airlineId) params.airlineId = filters.airlineId;
  if (filters.departureAirportId)
    params.departureAirportId = filters.departureAirportId;
  if (filters.arrivalAirportId)
    params.arrivalAirportId = filters.arrivalAirportId;
  if (filters.date) params.date = filters.date;

  const { data } = await api.get("/flights", { params });
  return data.data;
}

// GET /flights/:id
export async function getFlightById(id) {
  const { data } = await api.get(`/flights/${id}`);
  return data.data;
}

// POST /flights (ADMIN)
export async function createFlight(payload) {
  const { data } = await api.post("/flights", payload);
  return data.data;
}

// PUT /flights/:id (ADMIN)
export async function updateFlight(id, payload) {
  const { data } = await api.put(`/flights/${id}`, payload);
  return data.data;
}

// DELETE /flights/:id (ADMIN)
export async function deleteFlight(id) {
  const { data } = await api.delete(`/flights/${id}`);
  return data;
}
