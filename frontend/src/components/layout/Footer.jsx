import {
  Box,
  Typography,
  Container,
} from "@mui/material";

export default function Footer() {
  return (
    <Box
      sx={{
        background: "#0B3C5D",
        color: "#fff",
        mt: 10,
        py: 4,
      }}
    >
      <Container maxWidth="lg">

        <Typography
          variant="h5"
          gutterBottom
        >
          SkyReserve
        </Typography>

        <Typography>
          Your trusted airline reservation platform.
        </Typography>

        <Typography
          sx={{
            mt: 3,
            opacity: 0.7,
          }}
        >
          © 2026 SkyReserve. All Rights Reserved.
        </Typography>

      </Container>
    </Box>
  );
}