import api from "../api/axios";

// GET /admin/users (ADMIN)
export async function getAllUsers() {
  const { data } = await api.get("/admin/users");
  return data.data;
}

// PATCH /admin/users/:id/role (ADMIN) - { role: "USER" | "ADMIN" }
export async function updateUserRole(id, role) {
  const { data } = await api.patch(`/admin/users/${id}/role`, { role });
  return data.data;
}
