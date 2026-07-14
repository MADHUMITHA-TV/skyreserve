import { useState } from "react";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import SeatLegend from "../../components/seat/SeatLegend";
import SeatMap from "../../components/seat/SeatMap";
import PassengerSummary from "../../components/seat/PassengerSummary";

import { getSeats } from "../../services/seatService";

import {
  Box,
  Container,
  Grid,
  Stack,
} from "@mui/material";

export default function SeatSelection() {

  const [selectedSeats, setSelectedSeats] =
    useState([]);

  const seats = getSeats();

  return (
    <>
      <Navbar />

      <Box
        sx={{
          pt: 12,
          pb: 8,
          background: "#F5F7FB",
          minHeight: "100vh",
        }}
      >

        <Container maxWidth="xl">

          <Stack
            spacing={4}
          >

            <SeatLegend />

            <Grid
              container
              spacing={4}
            >

              <Grid
                size={{
                  xs: 12,
                  lg: 8,
                }}
              >

                <SeatMap
                  seats={seats}
                  selectedSeats={
                    selectedSeats
                  }
                  setSelectedSeats={
                    setSelectedSeats
                  }
                />

              </Grid>

              <Grid
                size={{
                  xs: 12,
                  lg: 4,
                }}
              >

                <PassengerSummary
                  selectedSeats={
                    selectedSeats
                  }
                />

              </Grid>

            </Grid>

          </Stack>

        </Container>

      </Box>

      <Footer />
    </>
  );
}