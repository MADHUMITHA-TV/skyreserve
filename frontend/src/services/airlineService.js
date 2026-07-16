import api from "../api/axios";

export async function getAirlines() {
  const { data } = await api.get("/airlines");
  return data.data;
}

export async function getAirline(id) {
  const { data } = await api.get(`/airlines/${id}`);
  return data.data;
}

// ADMIN only
export async function createAirline(payload) {
  const { data } = await api.post("/airlines", payload);
  return data.data;
}

export async function updateAirline(id, payload) {
  const { data } = await api.put(`/airlines/${id}`, payload);
  return data.data;
}

export async function deleteAirline(id) {
  const { data } = await api.delete(`/airlines/${id}`);
  return data;
}
