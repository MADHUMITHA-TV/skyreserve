import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Stack,
  Divider,
  Button,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Alert,
} from "@mui/material";

import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import { getBookingById } from "../../services/bookingService";
import {
  createPayment,
  getPaymentByBooking,
  payForBooking,
} from "../../services/paymentService";
import { getApiErrorMessage } from "../../api/axios";
import { PAYMENT_METHODS } from "../../utils/constants";
import { formatCurrency } from "../../utils/format";

const methodIcons = {
  CARD: <CreditCardRoundedIcon />,
  UPI: <QrCode2RoundedIcon />,
  NET_BANKING: <AccountBalanceRoundedIcon />,
  WALLET: <AccountBalanceWalletRoundedIcon />,
};

const generateMockTransactionId = () =>
  "TXN" + Date.now().toString(36).toUpperCase() +
  Math.random().toString(36).slice(2, 6).toUpperCase();

export default function Payment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [method, setMethod] = useState("CARD");
  const [transactionId, setTransactionId] = useState(
    generateMockTransactionId()
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const bookingData = await getBookingById(bookingId);
        setBooking(bookingData);

        if (bookingData.status === "CONFIRMED") {
          setLoading(false);
          return;
        }

        try {
          const existingPayment = await getPaymentByBooking(bookingId);
          setPayment(existingPayment);
        } catch {
          // No payment yet - that's expected for a fresh PENDING booking.
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to load booking."));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [bookingId]);

  const handleCreatePayment = async () => {
    try {
      setProcessing(true);
      const newPayment = await createPayment(bookingId, method);
      setPayment(newPayment);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Unable to start payment."));
    } finally {
      setProcessing(false);
    }
  };

  const handlePay = async () => {
    if (!payment) return;

    if (transactionId.trim().length < 5) {
      toast.error("Transaction ID must be at least 5 characters.");
      return;
    }

    try {
      setProcessing(true);
      await payForBooking(payment.id, transactionId.trim());
      toast.success("Payment successful! Your booking is confirmed.");
      navigate("/my-bookings");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Payment failed."));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ pt: 18, minHeight: "100vh", display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
        <Footer />
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <Navbar />
        <Box sx={{ pt: 18, minHeight: "100vh" }}>
          <Container>
            <Alert severity="error">{error || "Booking not found."}</Alert>
          </Container>
        </Box>
        <Footer />
      </>
    );
  }

  if (booking.status === "CANCELLED") {
    return (
      <>
        <Navbar />
        <Box sx={{ pt: 18, minHeight: "100vh" }}>
          <Container>
            <Alert severity="warning">
              This booking has been cancelled and can no longer be paid for.
            </Alert>
          </Container>
        </Box>
        <Footer />
      </>
    );
  }

  if (booking.status === "CONFIRMED") {
    return (
      <>
        <Navbar />
        <Box sx={{ pt: 18, minHeight: "100vh" }}>
          <Container maxWidth="sm">
            <Paper sx={{ p: 5, borderRadius: 5, textAlign: "center" }}>
              <VerifiedRoundedIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" fontWeight={700} mb={1}>
                Already Paid
              </Typography>
              <Typography color="text.secondary" mb={3}>
                This booking is already confirmed.
              </Typography>
              <Button variant="contained" onClick={() => navigate("/my-bookings")}>
                View My Bookings
              </Button>
            </Paper>
          </Container>
        </Box>
        <Footer />
      </>
    );
  }

  const totalAmount = payment?.amount ?? booking.totalAmount;

  return (
    <>
      <Navbar />

      <Box sx={{ pt: 12, pb: 8, background: "#F5F7FB", minHeight: "100vh" }}>
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight={700} mb={1}>
            Complete Payment
          </Typography>

          <Typography color="text.secondary" mb={4}>
            Booking {booking.bookingCode} · {booking.flight?.airline?.name}{" "}
            {booking.flight?.flightNumber}
          </Typography>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper sx={{ p: 4, borderRadius: 4 }}>
                {!payment ? (
                  <>
                    <Typography variant="h6" fontWeight={700} mb={2}>
                      Choose a Payment Method
                    </Typography>

                    <ToggleButtonGroup
                      value={method}
                      exclusive
                      onChange={(e, value) => value && setMethod(value)}
                      sx={{ flexWrap: "wrap", gap: 1.5, mb: 4 }}
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <ToggleButton
                          key={m.value}
                          value={m.value}
                          sx={{
                            px: 3,
                            py: 2,
                            borderRadius: 3,
                            textTransform: "none",
                            gap: 1,
                          }}
                        >
                          {methodIcons[m.value]}
                          {m.label}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={processing}
                      sx={{ height: 56 }}
                      onClick={handleCreatePayment}
                    >
                      {processing ? "Please wait..." : "Proceed to Pay"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Typography variant="h6" fontWeight={700} mb={2}>
                      Confirm Payment
                    </Typography>

                    <Alert severity="info" sx={{ mb: 3 }}>
                      Paying via{" "}
                      {PAYMENT_METHODS.find((m) => m.value === payment.paymentMethod)
                        ?.label || payment.paymentMethod}
                      . This is a simulated gateway - a transaction ID is
                      generated for you automatically.
                    </Alert>

                    <TextField
                      fullWidth
                      label="Transaction ID"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      helperText="Auto-generated, but you can edit it."
                      sx={{ mb: 3 }}
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={processing}
                      sx={{ height: 56 }}
                      onClick={handlePay}
                    >
                      {processing
                        ? "Processing..."
                        : `Pay ${formatCurrency(totalAmount)}`}
                    </Button>
                  </>
                )}
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Paper sx={{ p: 4, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>
                  Order Summary
                </Typography>

                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Passengers</Typography>
                    <Typography>{booking.passengers?.length ?? 1}</Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Route</Typography>
                    <Typography>
                      {booking.flight?.departureAirport?.code} →{" "}
                      {booking.flight?.arrivalAirport?.code}
                    </Typography>
                  </Stack>

                  <Divider />

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={700}>
                      Total
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight={700}>
                      {formatCurrency(totalAmount)}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Footer />
    </>
  );
}
