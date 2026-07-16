import axios from "axios";

// Base URL of the SkyReserve API. Configure per-environment via Vite env vars,
// e.g. VITE_API_BASE_URL=http://localhost:5000/api/v1
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

// Kept outside React state so the interceptors (and every service call)
// always read the latest token without needing a re-render.
let accessToken = localStorage.getItem("accessToken") || null;

export const setAccessToken = (token) => {
  accessToken = token;

  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
};

export const getAccessToken = () => accessToken;

const api = axios.create({
  baseURL: API_BASE_URL,
  // The refresh token is delivered as an httpOnly cookie by the backend,
  // so every request needs to carry credentials.
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// --- Silent refresh handling ---------------------------------------------
// If multiple requests fail with 401 at the same time, only the first one
// should trigger a refresh; the rest wait for that same refresh to resolve.
let isRefreshing = false;
let pendingQueue = [];

const resolveQueue = (error, token) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });

  pendingQueue = [];
};

let onAuthExpired = () => {};
export const registerAuthExpiredHandler = (handler) => {
  onAuthExpired = handler;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh-token");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = data?.data?.accessToken;
        setAccessToken(newToken);

        resolveQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        resolveQueue(refreshError, null);
        setAccessToken(null);
        onAuthExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Convenience helper for pulling a readable message out of any API error.
export const getApiErrorMessage = (error, fallback = "Something went wrong") => {
  const data = error?.response?.data;

  if (!data) return fallback;

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors[0].msg || data.errors[0].message || fallback;
  }

  return data.message || fallback;
};

export default api;
