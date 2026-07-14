import { useMemo } from "react";

import {
  Box,
  Stack,
  Paper,
  Typography,
} from "@mui/material";

export default function SeatMap({
  seats,
  selectedSeats,
  setSelectedSeats,
}) {
  const groupedSeats = useMemo(() => {
    const rows = {};

    seats.forEach((seat) => {
      const row = parseInt(
        seat.seatNumber.slice(0, -1)
      );

      if (!rows[row]) rows[row] = [];

      rows[row].push(seat);
    });

    return rows;
  }, [seats]);

  const toggleSeat = (seat) => {
    if (seat.status === "BOOKED") return;

    if (
      selectedSeats.includes(
        seat.seatNumber
      )
    ) {
      setSelectedSeats(
        selectedSeats.filter(
          (s) => s !== seat.seatNumber
        )
      );
    } else {
      setSelectedSeats([
        ...selectedSeats,
        seat.seatNumber,
      ]);
    }
  };

  return (
    <Paper
      sx={{
        p: 4,
        borderRadius: 5,
      }}
    >
      <Typography
        variant="h4"
        mb={4}
        fontWeight={700}
      >
        Select Your Seat
      </Typography>

      <Stack spacing={1}>

        {Object.entries(groupedSeats).map(
          ([row, rowSeats]) => (
            <Stack
              key={row}
              direction="row"
              spacing={1}
              justifyContent="center"
              alignItems="center"
            >
              <Typography
                sx={{
                  width: 35,
                  textAlign: "center",
                  color:
                    "text.secondary",
                }}
              >
                {row}
              </Typography>

              {rowSeats.map(
                (seat, index) => (
                  <>
                    {index === 3 && (
                      <Box
                        sx={{
                          width: 30,
                        }}
                      />
                    )}

                    <Box
                      key={
                        seat.id
                      }
                      onClick={() =>
                        toggleSeat(
                          seat
                        )
                      }
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        cursor:
                          seat.status ===
                          "BOOKED"
                            ? "not-allowed"
                            : "pointer",

                        transition:
                          ".25s",

                        display:
                          "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "center",

                        fontSize: 13,

                        fontWeight: 700,

                        userSelect:
                          "none",

                        bgcolor:
                          seat.status ===
                          "BOOKED"
                            ? "#EF4444"
                            : selectedSeats.includes(
                                seat.seatNumber
                              )
                            ? "#2563EB"
                            : "#22C55E",

                        color:
                          "white",

                        "&:hover": {
                          transform:
                            seat.status ===
                            "BOOKED"
                              ? "none"
                              : "scale(1.08)",
                        },
                      }}
                    >
                      {
                        seat.seatNumber
                      }
                    </Box>
                  </>
                )
              )}
            </Stack>
          )
        )}

      </Stack>
    </Paper>
  );
}