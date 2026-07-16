import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

import useAuth from "../hooks/useAuth";

// Guards any route tree that requires a logged-in user. Redirects to
// /login and remembers where the person was headed so we can send them
// back after they authenticate.
export default function ProtectedRoute() {
  const { isAuthenticated, booting } = useAuth();
  const location = useLocation();

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
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
