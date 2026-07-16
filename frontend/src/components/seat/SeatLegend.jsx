import { Stack, Chip } from "@mui/material";

export default function SeatLegend() {
  return (
    <Stack direction="row" spacing={2} flexWrap="wrap">
      <Chip label="Available" sx={{ bgcolor: "#22C55E", color: "white" }} />
      <Chip label="Selected" sx={{ bgcolor: "#2563EB", color: "white" }} />
      <Chip label="Locked by another user" sx={{ bgcolor: "#F59E0B", color: "white" }} />
      <Chip label="Booked" sx={{ bgcolor: "#EF4444", color: "white" }} />
    </Stack>
  );
}
