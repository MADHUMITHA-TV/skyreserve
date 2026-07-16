import api from "../api/axios";

export async function getAircrafts() {
  const { data } = await api.get("/aircrafts");
  return data.data;
}

export async function getAircraft(id) {
  const { data } = await api.get(`/aircrafts/${id}`);
  return data.data;
}

// ADMIN only
export async function createAircraft(payload) {
  const { data } = await api.post("/aircrafts", payload);
  return data.data;
}

export async function updateAircraft(id, payload) {
  const { data } = await api.put(`/aircrafts/${id}`, payload);
  return data.data;
}

export async function deleteAircraft(id) {
  const { data } = await api.delete(`/aircrafts/${id}`);
  return data;
}
