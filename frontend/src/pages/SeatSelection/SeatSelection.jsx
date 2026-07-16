import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import SeatLegend from "../../components/seat/SeatLegend";
import SeatMap from "../../components/seat/SeatMap";
import PassengerSummary from "../../components/seat/PassengerSummary";

import { getSeatsByFlight } from "../../services/flightSeatService";
import {
  lockSeat,
  unlockSeat,
  refreshSeatLock,
} from "../../services/bookingService";
import { getApiErrorMessage } from "../../api/axios";

import { Box, Container, Grid, Stack, Alert } from "@mui/material";

// How often we ping the backend to keep the Redis lock alive while the
// traveller is still browsing this page.
const LOCK_REFRESH_INTERVAL_MS = 20000;
const LOCK_TTL_SECONDS = 120; // mirrors the backend's redisLock TTL

export default function SeatSelection() {
  const { id: flightId } = useParams();
  const navigate = useNavigate();

  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSeat, setSelectedSeat] = useState(null);
  const [lockingSeatId, setLockingSeatId] = useState(null);
  const [ttl, setTtl] = useState(null);

  const refreshTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const lockedSeatRef = useRef(null);

  const loadSeats = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getSeatsByFlight(flightId);
      setSeats(data || []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load seat map."));
    } finally {
      setLoading(false);
    }
  }, [flightId]);

  useEffect(() => {
    loadSeats();
  }, [loadSeats]);

  const stopTimers = () => {
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const startTimers = useCallback((seatId) => {
    stopTimers();

    setTtl(LOCK_TTL_SECONDS);

    countdownRef.current = setInterval(() => {
      setTtl((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    refreshTimerRef.current = setInterval(async () => {
      try {
        await refreshSeatLock(seatId);
        setTtl(LOCK_TTL_SECONDS);
      } catch {
        // Lock likely expired or was taken over - resync from the server.
        toast.error("Your seat hold expired. Please select again.");
        setSelectedSeat(null);
        lockedSeatRef.current = null;
        stopTimers();
        setTtl(null);
        loadSeats();
      }
    }, LOCK_REFRESH_INTERVAL_MS);
  }, [loadSeats]);

  // Release the lock if the traveller navigates away without completing
  // the booking (e.g. closes the tab or hits back).
  useEffect(() => {
    return () => {
      stopTimers();
      if (lockedSeatRef.current) {
        unlockSeat(lockedSeatRef.current).catch(() => {});
      }
    };
  }, []);

  const handleSelectSeat = async (seat) => {
    if (selectedSeat?.id === seat.id) return;

    setLockingSeatId(seat.id);

    try {
      // Release any previously held seat before locking the new one.
      if (lockedSeatRef.current) {
        await unlockSeat(lockedSeatRef.current).catch(() => {});
      }

      await lockSeat(seat.id);

      lockedSeatRef.current = seat.id;
      setSelectedSeat(seat);
      startTimers(seat.id);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "That seat was just taken."));
      loadSeats();
    } finally {
      setLockingSeatId(null);
    }
  };

  const handleContinue = () => {
    if (!selectedSeat) return;

    // Booking page owns the seat lock from here on; don't release it on unmount.
    lockedSeatRef.current = null;
    stopTimers();

    navigate(`/booking?flightId=${flightId}&seatId=${selectedSeat.id}`);
  };

  return (
    <>
      <Navbar />

      <Box sx={{ pt: 12, pb: 8, background: "#F5F7FB", minHeight: "100vh" }}>
        <Container maxWidth="xl">
          <Stack spacing={4}>
            <SeatLegend />

            {error && <Alert severity="error">{error}</Alert>}

            <Grid container spacing={4}>
              <Grid size={{ xs: 12, lg: 8 }}>
                <SeatMap
                  seats={seats}
                  selectedSeatId={selectedSeat?.id || null}
                  onSelectSeat={handleSelectSeat}
                  loading={loading}
                  lockingSeatId={lockingSeatId}
                />
              </Grid>

              <Grid size={{ xs: 12, lg: 4 }}>
                <PassengerSummary
                  selectedSeat={selectedSeat}
                  ttl={ttl}
                  onContinue={handleContinue}
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
