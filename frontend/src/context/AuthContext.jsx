import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  refreshSession,
} from "../services/authService";

import { getProfile } from "../services/userService";
import { registerAuthExpiredHandler, setAccessToken } from "../api/axios";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // "booting" = we're still trying to silently restore a session via the
  // refresh-token cookie before we render anything auth-gated.
  const [booting, setBooting] = useState(true);
  const [loading, setLoading] = useState(false);

  const hydrateProfile = useCallback(async () => {
    try {
      const profile = await getProfile();
      setUser(profile);
      return profile;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  // On first load, try to silently exchange the httpOnly refresh cookie
  // for a fresh access token so a page reload doesn't force a re-login.
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await refreshSession();
        if (mounted) await hydrateProfile();
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setBooting(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [hydrateProfile]);

  // If a refresh ever fails mid-session (revoked/expired), fall back to a
  // logged-out state so the UI can react (redirect to /login etc.).
  useEffect(() => {
    registerAuthExpiredHandler(() => setUser(null));
  }, []);

  const login = useCallback(
    async (credentials) => {
      setLoading(true);
      try {
        const result = await loginRequest(credentials);
        setUser(result.user);
        return result.user;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const register = useCallback(async (payload) => {
    setLoading(true);
    try {
      return await registerRequest(payload);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const refreshProfile = useCallback(() => hydrateProfile(), [hydrateProfile]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "ADMIN",
      booting,
      loading,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, booting, loading, login, register, logout, refreshProfile]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
