import {
  Stack,
  Chip,
} from "@mui/material";

export default function SeatLegend() {
  return (
    <Stack
      direction="row"
      spacing={2}
      flexWrap="wrap"
    >
      <Chip
        label="Available"
        color="success"
      />

      <Chip
        label="Selected"
        color="primary"
      />

      <Chip
        label="Booked"
        color="error"
      />
    </Stack>
  );
}