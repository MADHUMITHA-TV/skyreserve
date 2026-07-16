import { useMemo } from "react";

import { Box, Stack, Paper, Typography, CircularProgress } from "@mui/material";

import { SEAT_STATUS } from "../../utils/constants";

const seatColor = (seat, isSelected) => {
  if (seat.status === SEAT_STATUS.BOOKED) return "#EF4444";
  if (isSelected) return "#2563EB";
  if (seat.status === SEAT_STATUS.LOCKED) return "#F59E0B";
  return "#22C55E";
};

const isSelectable = (seat) => seat.status === SEAT_STATUS.AVAILABLE;

export default function SeatMap({
  seats,
  selectedSeatId,
  onSelectSeat,
  loading,
  lockingSeatId,
}) {
  const groupedSeats = useMemo(() => {
    const rows = {};

    seats.forEach((seat) => {
      const row = parseInt(seat.seatNumber.slice(0, -1), 10);
      if (!rows[row]) rows[row] = [];
      rows[row].push(seat);
    });

    return rows;
  }, [seats]);

  return (
    <Paper sx={{ p: 4, borderRadius: 5 }}>
      <Typography variant="h4" mb={4} fontWeight={700}>
        Select Your Seat
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={1}>
          {Object.entries(groupedSeats)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([row, rowSeats]) => (
              <Stack
                key={row}
                direction="row"
                spacing={1}
                justifyContent="center"
                alignItems="center"
              >
                <Typography
                  sx={{ width: 35, textAlign: "center", color: "text.secondary" }}
                >
                  {row}
                </Typography>

                {rowSeats.map((seat, index) => {
                  const isSelected = seat.id === selectedSeatId;
                  const selectable = isSelectable(seat) || isSelected;
                  const isBusy = lockingSeatId === seat.id;

                  return (
                    <Box key={seat.id} sx={{ display: "flex" }}>
                      {index === 3 && <Box sx={{ width: 30 }} />}

                      <Box
                        onClick={() => selectable && onSelectSeat(seat)}
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2,
                          cursor: selectable ? "pointer" : "not-allowed",
                          transition: ".25s",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 700,
                          userSelect: "none",
                          opacity: isBusy ? 0.5 : 1,
                          bgcolor: seatColor(seat, isSelected),
                          color: "white",
                          "&:hover": {
                            transform: selectable ? "scale(1.08)" : "none",
                          },
                        }}
                      >
                        {seat.seatNumber}
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            ))}
        </Stack>
      )}
    </Paper>
  );
}
