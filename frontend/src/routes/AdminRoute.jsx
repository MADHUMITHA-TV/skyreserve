import { Navigate, Outlet } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import useAuth from "../hooks/useAuth";

// Guards /admin/* - requires both an authenticated session and ADMIN role.
export default function AdminRoute() {
  const { isAuthenticated, isAdmin, booting } = useAuth();

  if (booting) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
