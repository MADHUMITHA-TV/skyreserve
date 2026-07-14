import { useEffect, useState } from "react";

import {
  Box,
  CircularProgress,
  Alert,
  Stack,
  Typography,
} from "@mui/material";

import FlightCard from "./FlightCard";

import { getFlights } from "../../services/flightService";

export default function FlightList() {

  const [flights, setFlights] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {

    const loadFlights = async () => {

      try {

        const data = await getFlights();

        setFlights(data);

      } catch {

        setError("Unable to load flights.");

      } finally {

        setLoading(false);

      }

    };

    loadFlights();

  }, []);

  if (loading) {

    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 10,
        }}
      >
        <CircularProgress />
      </Box>
    );

  }

  if (error) {

    return (
      <Alert severity="error">
        {error}
      </Alert>
    );

  }

  return (

    <Stack spacing={3}>

      <Typography
        variant="h5"
        fontWeight={700}
      >
        Available Flights
      </Typography>

      {flights.map((flight) => (

        <FlightCard
          key={flight.id}
          flight={flight}
        />

      ))}

    </Stack>

  );

}