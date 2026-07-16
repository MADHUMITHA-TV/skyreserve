import { useEffect, useState } from "react";

import {
  Box,
  CircularProgress,
  Alert,
  Stack,
  Typography,
} from "@mui/material";

import { useSearchParams } from "react-router-dom";

import FlightCard from "./FlightCard";
import { getFlights } from "../../services/flightService";
import { getApiErrorMessage } from "../../api/axios";

export default function FlightList() {
  const [searchParams] = useSearchParams();

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFlights = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getFlights({
          departureAirportId: searchParams.get("departureAirportId"),
          arrivalAirportId: searchParams.get("arrivalAirportId"),
          date: searchParams.get("date"),
        });

        setFlights(data || []);
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load flights."));
      } finally {
        setLoading(false);
      }
    };

    loadFlights();
  }, [searchParams]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={700}>
        {flights.length
          ? `${flights.length} Flight${flights.length > 1 ? "s" : ""} Found`
          : "Available Flights"}
      </Typography>

      {flights.length === 0 && (
        <Alert severity="info">
          No flights match your search. Try different airports or dates.
        </Alert>
      )}

      {flights.map((flight) => (
        <FlightCard key={flight.id} flight={flight} />
      ))}
    </Stack>
  );
}
