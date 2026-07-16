import {
  Paper,
  Typography,
  Divider,
  Stack,
  Button,
  Chip,
} from "@mui/material";

import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import EventSeatRoundedIcon from "@mui/icons-material/EventSeatRounded";
import { useNavigate } from "react-router-dom";

import { FARE_PER_PASSENGER } from "../../utils/constants";
import { formatCurrency } from "../../utils/format";

export default function BookingCard({ flight, availableSeatCount }) {
  const navigate = useNavigate();
  const isBookable = flight.status !== "CANCELLED";

  return (
    <Paper
      sx={{
        p: 4,
        borderRadius: 5,
        position: "sticky",
        top: 110,
      }}
    >
      <Typography variant="h5" fontWeight={700}>
        Book this Flight
      </Typography>

      <Typography sx={{ mt: 2, color: "text.secondary" }}>
        Fare per Passenger
      </Typography>

      <Typography variant="h3" color="primary" fontWeight={700}>
        {formatCurrency(FARE_PER_PASSENGER)}
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between">
          <Typography>Status</Typography>
          <Chip
            label={flight.status}
            color={isBookable ? "success" : "error"}
            size="small"
          />
        </Stack>

        {typeof availableSeatCount === "number" && (
          <Stack direction="row" justifyContent="space-between">
            <Typography>Seats Left</Typography>
            <Typography fontWeight={600}>{availableSeatCount}</Typography>
          </Stack>
        )}

        <Stack direction="row" spacing={1} alignItems="center">
          <VerifiedRoundedIcon color="success" />
          <Typography>Instant Confirmation</Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <EventSeatRoundedIcon color="primary" />
          <Typography>Free Seat Selection</Typography>
        </Stack>
      </Stack>

      <Button
        fullWidth
        size="large"
        variant="contained"
        disabled={!isBookable || availableSeatCount === 0}
        sx={{ mt: 4, height: 56, borderRadius: 3 }}
        onClick={() => navigate(`/flights/${flight.id}/seats`)}
      >
        {availableSeatCount === 0 ? "Fully Booked" : "Continue Booking"}
      </Button>
    </Paper>
  );
}
