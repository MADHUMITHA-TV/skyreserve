import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
} from "@mui/material";

import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import LuggageRoundedIcon from "@mui/icons-material/LuggageRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";

import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    toast.success("Logged out");
    navigate("/");
  };

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={1}
      sx={{ background: "#fff" }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <FlightTakeoffIcon color="primary" sx={{ mr: 1, fontSize: 34 }} />

          <Typography
            component={Link}
            to="/"
            variant="h5"
            color="primary"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            SkyReserve
          </Typography>

          <Button component={Link} to="/" color="inherit">
            Home
          </Button>

          <Button component={Link} to="/flights" color="inherit">
            Flights
          </Button>

          {isAuthenticated && (
            <Button component={Link} to="/my-bookings" color="inherit">
              My Bookings
            </Button>
          )}

          {isAdmin && (
            <Button component={Link} to="/admin" color="inherit">
              Admin
            </Button>
          )}

          {!isAuthenticated ? (
            <>
              <Button component={Link} to="/login" color="inherit">
                Login
              </Button>

              <Button
                variant="contained"
                component={Link}
                to="/register"
                sx={{ ml: 2 }}
              >
                Register
              </Button>
            </>
          ) : (
            <>
              <Avatar
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  ml: 2,
                  cursor: "pointer",
                  bgcolor: "primary.main",
                  width: 40,
                  height: 40,
                }}
              >
                {user?.firstName?.[0]?.toUpperCase() || "U"}
              </Avatar>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography fontWeight={600}>
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                </Box>

                <Divider />

                <MenuItem
                  component={Link}
                  to="/profile"
                  onClick={() => setAnchorEl(null)}
                >
                  <ListItemIcon>
                    <PersonRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>

                <MenuItem
                  component={Link}
                  to="/my-bookings"
                  onClick={() => setAnchorEl(null)}
                >
                  <ListItemIcon>
                    <LuggageRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  My Bookings
                </MenuItem>

                {isAdmin && (
                  <MenuItem
                    component={Link}
                    to="/admin"
                    onClick={() => setAnchorEl(null)}
                  >
                    <ListItemIcon>
                      <AdminPanelSettingsRoundedIcon fontSize="small" />
                    </ListItemIcon>
                    Admin Panel
                  </MenuItem>
                )}

                <Divider />

                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutRoundedIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
