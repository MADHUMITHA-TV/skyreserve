import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
} from "@mui/material";

import FlightTakeoffRoundedIcon from "@mui/icons-material/FlightTakeoffRounded";

import SearchFlightCard from "./SearchFlightCard";

export default function Hero() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage:
          "linear-gradient(rgba(11,60,93,.75),rgba(11,60,93,.75)),url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container maxWidth="xl">

        <Stack spacing={3}>

          <Typography
            variant="h1"
            color="white"
            sx={{
              maxWidth: 800,
            }}
          >
            Discover the World with SkyReserve
          </Typography>

          <Typography
            variant="h5"
            color="white"
            sx={{
              maxWidth: 700,
              opacity: .9,
            }}
          >
            Compare flights, reserve seats instantly and travel
            with confidence using our next-generation airline
            booking platform.
          </Typography>

          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<FlightTakeoffRoundedIcon />}
            sx={{
              width: 220,
              height: 55,
            }}
          >
            Explore Flights
          </Button>

          <SearchFlightCard />

        </Stack>

      </Container>
    </Box>
  );
}