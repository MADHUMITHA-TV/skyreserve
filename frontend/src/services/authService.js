import api, { setAccessToken } from "../api/axios";

// POST /auth/register
export async function register({ firstName, lastName, email, password }) {
  const { data } = await api.post("/auth/register", {
    firstName,
    lastName,
    email,
    password,
  });

  return data;
}

// POST /auth/login
// Backend sets the refresh token as an httpOnly cookie and returns
// { user, accessToken } in the body.
export async function login({ email, password }) {
  const { data } = await api.post("/auth/login", { email, password });

  if (data?.data?.accessToken) {
    setAccessToken(data.data.accessToken);
  }

  return data.data;
}

// POST /auth/logout - revokes the refresh token cookie server-side
export async function logout() {
  try {
    await api.post("/auth/logout");
  } finally {
    setAccessToken(null);
  }
}

// POST /auth/refresh-token - used on app boot to silently restore a session
export async function refreshSession() {
  const { data } = await api.post("/auth/refresh-token");

  if (data?.data?.accessToken) {
    setAccessToken(data.data.accessToken);
  }

  return data.data.accessToken;
}

// GET /auth/profile - lightweight "who am I" check (decoded JWT claims only)
export async function getAuthProfile() {
  const { data } = await api.get("/auth/profile");
  return data.data;
}
