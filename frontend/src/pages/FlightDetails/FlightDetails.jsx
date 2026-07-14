import { useMemo } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import { getFlightById } from "../../services/flightService";

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

export default function FlightDetails() {

  const { id } = useParams();

  const flight = useMemo(() => getFlightById(id), [id]);

  if (!flight) {
    return (
      <>
        <Navbar />

        <Box
          sx={{
            pt: 18,
            minHeight: "100vh",
          }}
        >
          <Container>

            <Typography variant="h3">
              Flight Not Found
            </Typography>

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
              background:
                "linear-gradient(135deg,#0B3C5D,#1E4F82)",
              color: "white",
            }}
          >

            <Stack
              direction={{
                xs: "column",
                md: "row",
              }}
              justifyContent="space-between"
              spacing={4}
            >

              <Stack spacing={2}>

                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                >

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
                      {flight.airline.name}
                    </Typography>

                    <Typography>
                      {flight.flightNumber}
                    </Typography>

                  </Box>

                </Stack>

                <Chip
                  label={flight.status}
                  color="success"
                  sx={{
                    width: 130,
                    color: "white",
                  }}
                />

              </Stack>

              <Typography
                variant="h3"
                fontWeight={700}
              >
                ₹{flight.price.toLocaleString()}
              </Typography>

            </Stack>

          </Paper>

          <Paper
            sx={{
              borderRadius: 5,
              p: 5,
              mb: 5,
            }}
          >

            <Grid
              container
              spacing={4}
              alignItems="center"
            >

              <Grid size={{ xs: 12, md: 4 }}>

                <Stack spacing={1}>

                  <Typography
                    variant="h3"
                    fontWeight={700}
                  >
                    {new Date(
                      flight.departureTime
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>

                  <Typography variant="h5">
                    {flight.departureAirport.code}
                  </Typography>

                  <Typography color="text.secondary">
                    {flight.departureAirport.city}
                  </Typography>

                </Stack>

              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>

                <Stack
                  spacing={2}
                  alignItems="center"
                >

                  <Typography>
                    {flight.duration}
                  </Typography>

                  <FlightTakeoffRoundedIcon
                    color="primary"
                  />

                  <Divider
                    sx={{
                      width: "100%",
                    }}
                  />

                  <FlightLandRoundedIcon
                    color="primary"
                  />

                </Stack>

              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>

                <Stack
                  spacing={1}
                  alignItems="flex-end"
                >

                  <Typography
                    variant="h3"
                    fontWeight={700}
                  >
                    {new Date(
                      flight.arrivalTime
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>

                  <Typography variant="h5">
                    {flight.arrivalAirport.code}
                  </Typography>

                  <Typography color="text.secondary">
                    {flight.arrivalAirport.city}
                  </Typography>

                </Stack>

              </Grid>

            </Grid>

          </Paper>

          <Paper
  sx={{
    p: 4,
    borderRadius: 5,
    mb: 4,
  }}
>

  <Typography
    variant="h5"
    fontWeight={700}
    mb={3}
  >
    Fare Breakdown
  </Typography>

  <Stack spacing={2}>

    <Stack
      direction="row"
      justifyContent="space-between"
    >
      <Typography>Base Fare</Typography>
      <Typography>
        ₹{Math.round(flight.price * 0.82).toLocaleString()}
      </Typography>
    </Stack>

    <Stack
      direction="row"
      justifyContent="space-between"
    >
      <Typography>Taxes & Fees</Typography>
      <Typography>
        ₹{Math.round(flight.price * 0.18).toLocaleString()}
      </Typography>
    </Stack>

    <Divider />

    <Stack
      direction="row"
      justifyContent="space-between"
    >
      <Typography
        variant="h6"
        fontWeight={700}
      >
        Total
      </Typography>

      <Typography
        variant="h6"
        color="primary"
        fontWeight={700}
      >
        ₹{flight.price.toLocaleString()}
      </Typography>
    </Stack>

  </Stack>

</Paper>

<Paper
  sx={{
    p: 4,
    borderRadius: 5,
    mb: 4,
  }}
>

  <Typography
    variant="h5"
    fontWeight={700}
    mb={3}
  >
    Aircraft Information
  </Typography>

  <Grid
    container
    spacing={3}
  >

    <Grid size={{ xs: 12, md: 4 }}>

      <Typography
        color="text.secondary"
      >
        Aircraft
      </Typography>

      <Typography fontWeight={600}>
        {flight.aircraft.model}
      </Typography>

    </Grid>

    <Grid size={{ xs: 12, md: 4 }}>

      <Typography
        color="text.secondary"
      >
        Cabin Class
      </Typography>

      <Typography fontWeight={600}>
        Economy
      </Typography>

    </Grid>

    <Grid size={{ xs: 12, md: 4 }}>

      <Typography
        color="text.secondary"
      >
        Seats Remaining
      </Typography>

      <Typography fontWeight={600}>
        {flight.availableSeats}
      </Typography>

    </Grid>

  </Grid>

</Paper>

<Paper
  sx={{
    p: 4,
    borderRadius: 5,
    mb: 4,
  }}
>

  <Typography
    variant="h5"
    fontWeight={700}
    mb={3}
  >
    Included Amenities
  </Typography>

  <Grid
    container
    spacing={3}
  >

    <Grid size={{ xs: 6, md: 3 }}>
      <Stack
        alignItems="center"
        spacing={1}
      >
        <WifiRounded color="primary" />
        <Typography>Free WiFi</Typography>
      </Stack>
    </Grid>

    <Grid size={{ xs: 6, md: 3 }}>
      <Stack
        alignItems="center"
        spacing={1}
      >
        <RestaurantRounded color="primary" />
        <Typography>Meals</Typography>
      </Stack>
    </Grid>

    <Grid size={{ xs: 6, md: 3 }}>
      <Stack
        alignItems="center"
        spacing={1}
      >
        <LuggageRounded color="primary" />
        <Typography>20kg Baggage</Typography>
      </Stack>
    </Grid>

    <Grid size={{ xs: 6, md: 3 }}>
      <Stack
        alignItems="center"
        spacing={1}
      >
        <EventSeatRounded color="primary" />
        <Typography>Seat Selection</Typography>
      </Stack>
    </Grid>

  </Grid>

</Paper>

<Paper
  sx={{
    p: 4,
    borderRadius: 5,
    mb: 6,
  }}
>

  <Typography
    variant="h5"
    fontWeight={700}
    mb={3}
  >
    Travel Policies
  </Typography>

  <Stack spacing={2}>

    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
    >
      <VerifiedRounded color="success" />

      <Typography>
        Free cancellation within 24 hours of booking.
      </Typography>

    </Stack>

    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
    >
      <SecurityRounded color="primary" />

      <Typography>
        Carry a valid government-issued ID during check-in.
      </Typography>

    </Stack>

  </Stack>

</Paper>
            <Stack
              direction="row"
              spacing={4}
              flexWrap="wrap"
            >

              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >

                <ScheduleRoundedIcon color="primary" />

                <Box>

                  <Typography fontWeight={600}>
                    Duration
                  </Typography>

                  <Typography color="text.secondary">
                    {flight.duration}
                  </Typography>

                </Box>

              </Stack>

              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >

                <AirplanemodeActiveRoundedIcon
                  color="primary"
                />

                <Box>

                  <Typography fontWeight={600}>
                    Aircraft
                  </Typography>

                  <Typography color="text.secondary">
                    {flight.aircraft.model}
                  </Typography>

                </Box>

              </Stack>

              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >

                <FlightTakeoffRoundedIcon
                  color="primary"
                />

                <Box>

                  <Typography fontWeight={600}>
                    Available Seats
                  </Typography>

                  <Typography color="text.secondary">
                    {flight.availableSeats}
                  </Typography>

                </Box>

              </Stack>

            </Stack>


        </Container>

      </Box>

      <Footer />

    </>
  );

}