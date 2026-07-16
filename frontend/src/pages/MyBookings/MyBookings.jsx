import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  Box,
  Container,
  Typography,
  Stack,
  Paper,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";

import FlightTakeoffRoundedIcon from "@mui/icons-material/FlightTakeoffRounded";
import EventSeatRoundedIcon from "@mui/icons-material/EventSeatRounded";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import { cancelBooking, getMyBookings } from "../../services/bookingService";
import { getApiErrorMessage } from "../../api/axios";
import { formatCurrency, formatDateTime } from "../../utils/format";

const statusColor = {
  PENDING: "warning",
  CONFIRMED: "success",
  CANCELLED: "error",
};

export default function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getMyBookings();
      setBookings(data || []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load your bookings."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;

    try {
      setCancelling(true);
      await cancelBooking(cancelTarget.id);
      toast.success("Booking cancelled.");
      setCancelTarget(null);
      loadBookings();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Unable to cancel booking."));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <Navbar />

      <Box sx={{ pt: 12, pb: 8, background: "#F5F7FB", minHeight: "100vh" }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} mb={4}>
            My Bookings
          </Typography>

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && error && <Alert severity="error">{error}</Alert>}

          {!loading && !error && bookings.length === 0 && (
            <Alert severity="info">
              You haven't made any bookings yet.{" "}
              <Button size="small" onClick={() => navigate("/flights")}>
                Browse Flights
              </Button>
            </Alert>
          )}

          <Stack spacing={3}>
            {bookings.map((booking) => (
              <Paper key={booking.id} sx={{ p: 4, borderRadius: 4 }}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ md: "center" }}
                  spacing={2}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 54,
                        height: 54,
                        borderRadius: 3,
                        background: "#E3F2FD",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FlightTakeoffRoundedIcon color="primary" />
                    </Box>

                    <Box>
                      <Typography fontWeight={700}>
                        {booking.flight?.airline?.name}{" "}
                        {booking.flight?.flightNumber}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {booking.flight?.departureAirport?.code} →{" "}
                        {booking.flight?.arrivalAirport?.code} ·{" "}
                        {formatDateTime(booking.flight?.departureTime)}
                      </Typography>
                    </Box>
                  </Stack>

                  <Chip
                    label={booking.status}
                    color={statusColor[booking.status] || "default"}
                  />
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Stack direction="row" spacing={3} flexWrap="wrap">
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Booking Code
                      </Typography>
                      <Typography fontWeight={600}>
                        {booking.bookingCode}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Passengers
                      </Typography>
                      <Typography fontWeight={600}>
                        {booking.passengers?.length ?? 0}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Amount
                      </Typography>
                      <Typography fontWeight={600} color="primary">
                        {formatCurrency(booking.totalAmount)}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={2}>
                    {booking.status === "PENDING" && (
                      <>
                        <Button
                          variant="contained"
                          onClick={() => navigate(`/payment/${booking.id}`)}
                        >
                          Pay Now
                        </Button>

                        <Button
                          color="error"
                          variant="outlined"
                          onClick={() => setCancelTarget(booking)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}

                    {booking.status === "CONFIRMED" && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <EventSeatRoundedIcon color="success" fontSize="small" />
                        <Typography variant="body2" color="text.secondary">
                          Confirmed &amp; paid
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Container>
      </Box>

      <Dialog open={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel booking{" "}
            {cancelTarget?.bookingCode}? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelTarget(null)}>Keep Booking</Button>
          <Button
            color="error"
            variant="contained"
            disabled={cancelling}
            onClick={handleConfirmCancel}
          >
            {cancelling ? "Cancelling..." : "Yes, Cancel"}
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </>
  );
}
