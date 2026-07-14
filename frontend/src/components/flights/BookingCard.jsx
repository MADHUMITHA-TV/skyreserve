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

export default function BookingCard({ flight }) {
  return (
    <Paper
      sx={{
        p: 4,
        borderRadius: 5,
        position: "sticky",
        top: 110,
      }}
    >
      <Typography
        variant="h5"
        fontWeight={700}
      >
        Book this Flight
      </Typography>

      <Typography
        sx={{
          mt: 2,
          color: "text.secondary",
        }}
      >
        Starting From
      </Typography>

      <Typography
        variant="h3"
        color="primary"
        fontWeight={700}
      >
        ₹{flight.price.toLocaleString()}
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Stack spacing={2}>

        <Stack
          direction="row"
          justifyContent="space-between"
        >
          <Typography>
            Cabin
          </Typography>

          <Chip
            label="Economy"
            color="primary"
            size="small"
          />
        </Stack>

        <Stack
          direction="row"
          justifyContent="space-between"
        >
          <Typography>
            Seats Left
          </Typography>

          <Typography fontWeight={600}>
            {flight.availableSeats}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <VerifiedRoundedIcon
            color="success"
          />

          <Typography>
            Instant Confirmation
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <EventSeatRoundedIcon
            color="primary"
          />

          <Typography>
            Free Seat Selection
          </Typography>
        </Stack>

      </Stack>

      <Button
        fullWidth
        size="large"
        variant="contained"
        sx={{
          mt: 4,
          height: 56,
          borderRadius: 3,
        }}
      >
        Continue Booking
      </Button>

    </Paper>
  );
}