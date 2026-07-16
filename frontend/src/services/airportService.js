import api from "../api/axios";

export async function getAirports() {
  const { data } = await api.get("/airports");
  return data.data;
}

export async function getAirport(id) {
  const { data } = await api.get(`/airports/${id}`);
  return data.data;
}

// ADMIN only
export async function createAirport(payload) {
  const { data } = await api.post("/airports", payload);
  return data.data;
}

export async function updateAirport(id, payload) {
  const { data } = await api.put(`/airports/${id}`, payload);
  return data.data;
}

export async function deleteAirport(id) {
  const { data } = await api.delete(`/airports/${id}`);
  return data;
}
