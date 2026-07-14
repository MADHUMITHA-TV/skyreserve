import FlightTakeoffRoundedIcon from "@mui/icons-material/FlightTakeoffRounded";
import {
  Box,
  Typography,
  Stack,
} from "@mui/material";

const AuthBanner = () => {
  return (
    <Box
      sx={{
        height: "100%",
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#0F172A,#1D4ED8,#38BDF8)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 8,
      }}
    >
      <Stack spacing={4}>
        <FlightTakeoffRoundedIcon
          sx={{
            fontSize: 70,
          }}
        />

        <Typography
          variant="h2"
          fontWeight={700}
        >
          Welcome to
          <br />
          SkyReserve
        </Typography>

        <Typography
          variant="h6"
          sx={{
            opacity: .85,
            maxWidth: 500,
            lineHeight: 1.8,
          }}
        >
          Experience modern airline booking with
          seamless reservations, secure payments,
          real-time flight tracking and premium
          travel management.
        </Typography>
      </Stack>
    </Box>
  );
};

export default AuthBanner;