import { useState } from "react";
import {
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Divider,
  Link,
} from "@mui/material";

import {
  Visibility,
  VisibilityOff,
  FlightTakeoffRounded,
} from "@mui/icons-material";

import { Link as RouterLink } from "react-router-dom";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 500,
        p: 5,
        borderRadius: 5,
        backdropFilter: "blur(20px)",
        background: "rgba(255,255,255,.85)",
        border: "1px solid rgba(255,255,255,.4)",
        boxShadow: "0 20px 60px rgba(0,0,0,.08)",
      }}
    >
      <Stack spacing={3}>

        <Stack spacing={1} alignItems="center">
          <FlightTakeoffRounded
            color="primary"
            sx={{ fontSize: 48 }}
          />

          <Typography
            variant="h4"
            fontWeight={700}
          >
            Create Account
          </Typography>

          <Typography
            color="text.secondary"
            align="center"
          >
            Join SkyReserve and start booking flights effortlessly.
          </Typography>
        </Stack>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={2}
        >
          <TextField
            fullWidth
            label="First Name"
          />

          <TextField
            fullWidth
            label="Last Name"
          />
        </Stack>

        <TextField
          fullWidth
          label="Email"
          type="email"
        />

        <TextField
          fullWidth
          label="Phone Number"
        />

        <TextField
          fullWidth
          label="Password"
          type={showPassword ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <VisibilityOff />
                  ) : (
                    <Visibility />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Confirm Password"
          type={showPassword ? "text" : "password"}
        />

        <Button
          variant="contained"
          size="large"
          sx={{
            height: 56,
            borderRadius: 3,
            fontSize: 16,
          }}
        >
          Create Account
        </Button>

        <Divider>OR</Divider>

        <Button
          variant="outlined"
          size="large"
          sx={{
            height: 56,
            borderRadius: 3,
          }}
        >
          Continue with Google
        </Button>

        <Typography align="center">
          Already have an account?{" "}
          <Link
            component={RouterLink}
            to="/login"
            underline="hover"
          >
            Login
          </Link>
        </Typography>

      </Stack>
    </Paper>
  );
}