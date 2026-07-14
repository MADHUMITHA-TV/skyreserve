import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from "@mui/material";

import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";

import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={1}
      sx={{
        background: "#fff",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>

          <FlightTakeoffIcon
            color="primary"
            sx={{
              mr: 1,
              fontSize: 34,
            }}
          />

          <Typography
            variant="h5"
            color="primary"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
            }}
          >
            SkyReserve
          </Typography>

          <Button
            component={Link}
            to="/"
            color="inherit"
          >
            Home
          </Button>

          <Button
            component={Link}
            to="/flights"
            color="inherit"
          >
            Flights
          </Button>

          <Button
            component={Link}
            to="/my-bookings"
            color="inherit"
          >
            My Bookings
          </Button>

          <Button
            component={Link}
            to="/login"
            color="inherit"
          >
            Login
          </Button>

          <Button
            variant="contained"
            component={Link}
            to="/register"
            sx={{
              ml: 2,
            }}
          >
            Register
          </Button>

        </Toolbar>
      </Container>
    </AppBar>
  );
}