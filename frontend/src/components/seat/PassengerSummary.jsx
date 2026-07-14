import {
  Paper,
  Typography,
  Divider,
  Button,
} from "@mui/material";

export default function PassengerSummary({
  selectedSeats,
}) {
  return (
    <Paper
      sx={{
        p: 4,
        borderRadius: 4,
        position: "sticky",
        top: 110,
      }}
    >
      <Typography
        variant="h5"
        fontWeight={700}
      >
        Booking Summary
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography>
        Seats Selected
      </Typography>

      <Typography
        variant="h6"
        color="primary"
        fontWeight={700}
      >
        {selectedSeats.length}
      </Typography>

      <Typography
        sx={{ mt: 3 }}
      >
        {selectedSeats.join(", ") || "-"}
      </Typography>

      <Button
        fullWidth
        variant="contained"
        size="large"
        sx={{
          mt: 4,
          height: 55,
        }}
      >
        Continue
      </Button>
    </Paper>
  );
}