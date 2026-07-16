import { Box, Container, Typography, Button, Stack } from "@mui/material";
import FlightTakeoffRoundedIcon from "@mui/icons-material/FlightTakeoffRounded";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background: "#0B3C5D",
        color: "white",
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={3} alignItems="center" textAlign="center">
          <FlightTakeoffRoundedIcon sx={{ fontSize: 80, opacity: 0.85 }} />

          <Typography variant="h1" fontWeight={700}>
            404
          </Typography>

          <Typography variant="h5">
            Looks like this route has flown off course.
          </Typography>

          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
