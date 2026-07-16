import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import { getFlightById } from "../../services/flightService";
import { getAvailableSeats } from "../../services/flightSeatService";

import {
  Box,
  Container,
  Typography,
  Stack,
  Chip,
  Paper,
  Divider,
  Grid,
  Avatar,
  CircularProgress,
  Alert,
} from "@mui/material";

import FlightTakeoffRoundedIcon from "@mui/icons-material/FlightTakeoffRounded";
import FlightLandRoundedIcon from "@mui/icons-material/FlightLandRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import AirplanemodeActiveRoundedIcon from "@mui/icons-material/AirplanemodeActiveRounded";
import {
  WifiRounded,
  RestaurantRounded,
  LuggageRounded,
  EventSeatRounded,
  VerifiedRounded,
  SecurityRounded,
} from "@mui/icons-material";

import BookingCard from "../../components/flights/BookingCard";
import { getApiErrorMessage } from "../../api/axios";
import { formatDuration, formatTime } from "../../utils/format";

export default function FlightDetails() {
  const { id } = useParams();

  const [flight, setFlight] = useState(null);
  const [availableSeatCount, setAvailableSeatCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [flightData, seats] = await Promise.all([
          getFlightById(id),
          getAvailableSeats(id).catch(() => null),
        ]);

        if (!mounted) return;

        setFlight(flightData);
        if (seats) setAvailableSeatCount(seats.length);
      } catch (err) {
        if (mounted) setError(getApiErrorMessage(err, "Flight not found."));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <Box
          sx={{
            pt: 18,
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
        <Footer />
      </>
    );
  }

  if (error || !flight) {
    return (
      <>
        <Navbar />
        <Box sx={{ pt: 18, minHeight: "100vh" }}>
          <Container>
            <Alert severity="error">
              {error || "Flight Not Found"}
            </Alert>
          </Container>
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <Box
        sx={{
          pt: 12,
          background: "#F5F7FB",
          minHeight: "100vh",
        }}
      >
        <Container maxWidth="xl">
          <Paper
            sx={{
              p: 5,
              borderRadius: 5,
              mb: 4,
              background: "linear-gradient(135deg,#0B3C5D,#1E4F82)",
              color: "white",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              spacing={4}
            >
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      width: 70,
                      height: 70,
                      bgcolor: "white",
                      color: "#0B3C5D",
                    }}
                  >
                    <AirplanemodeActiveRoundedIcon />
                  </Avatar>

                  <Box>
                    <Typography variant="h4">
                      {flight.airline?.name}
                    </Typography>

                    <Typography>{flight.flightNumber}</Typography>
                  </Box>
                </Stack>

                <Chip
                  label={flight.status}
                  color={
                    flight.status === "CANCELLED" ? "error" : "success"
                  }
                  sx={{ width: 130, color: "white" }}
                />
              </Stack>
            </Stack>
          </Paper>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper sx={{ borderRadius: 5, p: 5, mb: 4 }}>
                <Grid container spacing={4} alignItems="center">
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={1}>
                      <Typography variant="h3" fontWeight={700}>
                        {formatTime(flight.departureTime)}
                      </Typography>

                      <Typography variant="h5">
                        {flight.departureAirport?.code}
                      </Typography>

                      <Typography color="text.secondary">
                        {flight.departureAirport?.city}
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={2} alignItems="center">
                      <Typography>
                        {formatDuration(
                          flight.departureTime,
                          flight.arrivalTime
                        )}
                      </Typography>

                      <FlightTakeoffRoundedIcon color="primary" />
                      <Divider sx={{ width: "100%" }} />
                      <FlightLandRoundedIcon color="primary" />
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={1} alignItems="flex-end">
                      <Typography variant="h3" fontWeight={700}>
                        {formatTime(flight.arrivalTime)}
                      </Typography>

                      <Typography variant="h5">
                        {flight.arrivalAirport?.code}
                      </Typography>

                      <Typography color="text.secondary">
                        {flight.arrivalAirport?.city}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 4, borderRadius: 5, mb: 4 }}>
                <Typography variant="h5" fontWeight={700} mb={3}>
                  Aircraft Information
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography color="text.secondary">Aircraft</Typography>
                    <Typography fontWeight={600}>
                      {flight.aircraft?.model}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography color="text.secondary">
                      Registration
                    </Typography>
                    <Typography fontWeight={600}>
                      {flight.aircraft?.registrationNumber || "-"}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography color="text.secondary">
                      Seats Remaining
                    </Typography>
                    <Typography fontWeight={600}>
                      {availableSeatCount ?? "-"}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 4, borderRadius: 5, mb: 4 }}>
                <Typography variant="h5" fontWeight={700} mb={3}>
                  Included Amenities
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Stack alignItems="center" spacing={1}>
                      <WifiRounded color="primary" />
                      <Typography>Free WiFi</Typography>
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 6, md: 3 }}>
                    <Stack alignItems="center" spacing={1}>
                      <RestaurantRounded color="primary" />
                      <Typography>Meals</Typography>
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 6, md: 3 }}>
                    <Stack alignItems="center" spacing={1}>
                      <LuggageRounded color="primary" />
                      <Typography>20kg Baggage</Typography>
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 6, md: 3 }}>
                    <Stack alignItems="center" spacing={1}>
                      <EventSeatRounded color="primary" />
                      <Typography>Seat Selection</Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>

              <Paper sx={{ p: 4, borderRadius: 5, mb: { xs: 4, lg: 0 } }}>
                <Typography variant="h5" fontWeight={700} mb={3}>
                  Travel Policies
                </Typography>

                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <VerifiedRounded color="success" />
                    <Typography>
                      Free cancellation before payment is completed.
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={2} alignItems="center">
                    <SecurityRounded color="primary" />
                    <Typography>
                      Carry a valid government-issued ID during check-in.
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <BookingCard
                flight={flight}
                availableSeatCount={availableSeatCount}
              />
            </Grid>
          </Grid>

          <Box sx={{ height: 40 }} />
        </Container>
      </Box>

      <Footer />
    </>
  );
}
