import api from "../api/axios";

// GET /users/profile - full user profile (name, email, phone, role, ...)
export async function getProfile() {
  const { data } = await api.get("/users/profile");
  return data.data;
}

// PUT /users/profile
export async function updateProfile(payload) {
  const { data } = await api.put("/users/profile", payload);
  return data.data;
}
