import { Paper, Typography, Divider, Button, Stack, Alert } from "@mui/material";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";

const formatTtl = (seconds) => {
  if (!seconds || seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

export default function PassengerSummary({ selectedSeat, ttl, onContinue }) {
  return (
    <Paper
      sx={{
        p: 4,
        borderRadius: 4,
        position: "sticky",
        top: 110,
      }}
    >
      <Typography variant="h5" fontWeight={700}>
        Booking Summary
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography>Seat Selected</Typography>

      <Typography variant="h6" color="primary" fontWeight={700}>
        {selectedSeat ? selectedSeat.seatNumber : "-"}
      </Typography>

      {selectedSeat && ttl !== null && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
          <TimerRoundedIcon
            fontSize="small"
            color={ttl <= 30 ? "error" : "action"}
          />
          <Typography
            variant="body2"
            color={ttl <= 30 ? "error" : "text.secondary"}
          >
            Held for {formatTtl(ttl)}
          </Typography>
        </Stack>
      )}

      {!selectedSeat && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Tap an available seat on the map to hold it.
        </Alert>
      )}

      <Button
        fullWidth
        variant="contained"
        size="large"
        disabled={!selectedSeat}
        sx={{ mt: 4, height: 55 }}
        onClick={onContinue}
      >
        Continue to Passenger Details
      </Button>
    </Paper>
  );
}
