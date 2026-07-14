import { Box, Grid } from "@mui/material";
import { Outlet } from "react-router-dom";
import AuthBanner from "../components/auth/AuthBanner";

const AuthLayout = () => {
  return (
    <Grid
      container
      sx={{
        minHeight: "100vh",
        background: "#F4F7FC",
      }}
    >
      <Grid
        size={{ xs: 0, md: 7 }}
        sx={{
          display: {
            xs: "none",
            md: "block",
          },
        }}
      >
        <AuthBanner />
      </Grid>

      <Grid
        size={{ xs: 12, md: 5 }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            p: 5,
          }}
        >
          <Outlet />
        </Box>
      </Grid>
    </Grid>
  );
};

export default AuthLayout;