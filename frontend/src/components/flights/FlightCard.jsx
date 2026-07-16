import {
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Chip,
  Divider,
  Box,
} from "@mui/material";

import FlightTakeoffRoundedIcon from "@mui/icons-material/FlightTakeoffRounded";
import FlightLandRoundedIcon from "@mui/icons-material/FlightLandRounded";

import { useNavigate } from "react-router-dom";

import { FARE_PER_PASSENGER } from "../../utils/constants";
import { formatCurrency, formatDuration, formatTime } from "../../utils/format";

export default function FlightCard({ flight }) {
  const navigate = useNavigate();

  const statusColor =
    flight.status === "CANCELLED"
      ? "error"
      : flight.status === "DEPARTED" || flight.status === "COMPLETED"
      ? "default"
      : "success";

  return (
    <Card
      sx={{
        borderRadius: 4,
        mb: 3,
        transition: ".25s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 18px 40px rgba(0,0,0,.12)",
        },
      }}
    >
      <CardContent>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={4}
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ minWidth: 220 }}
          >
            <Box
              sx={{
                width: 58,
                height: 58,
                borderRadius: 3,
                background: "#E3F2FD",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FlightTakeoffRoundedIcon color="primary" />
            </Box>

            <Box>
              <Typography fontWeight={700}>
                {flight.airline?.name}
              </Typography>

              <Typography color="text.secondary">
                {flight.flightNumber}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {flight.aircraft?.model}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={4} alignItems="center">
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700}>
                {formatTime(flight.departureTime)}
              </Typography>

              <Typography color="text.secondary">
                {flight.departureAirport?.code}
              </Typography>
            </Box>

            <Stack spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                {formatDuration(flight.departureTime, flight.arrivalTime)}
              </Typography>

              <Divider sx={{ width: 120 }} />

              <FlightLandRoundedIcon color="action" />
            </Stack>

            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700}>
                {formatTime(flight.arrivalTime)}
              </Typography>

              <Typography color="text.secondary">
                {flight.arrivalAirport?.code}
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={2} alignItems="flex-end">
            <Typography variant="h4" color="primary" fontWeight={700}>
              {formatCurrency(FARE_PER_PASSENGER)}
              <Typography component="span" variant="body2" color="text.secondary">
                {" "}
                / passenger
              </Typography>
            </Typography>

            <Chip label={flight.status} color={statusColor} />

            <Button
              variant="contained"
              size="large"
              disabled={flight.status === "CANCELLED"}
              onClick={() => navigate(`/flights/${flight.id}`)}
            >
              View Details
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
