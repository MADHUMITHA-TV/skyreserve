import { Outlet, Link, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <>
      <AppBar position="fixed" color="inherit" elevation={1} sx={{ background: "#fff" }}>
        <Toolbar>
          <AdminPanelSettingsRoundedIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
            SkyReserve Admin
          </Typography>
          <Button component={Link} to="/" color="inherit">
            View Site
          </Button>
          <Button onClick={handleLogout} color="inherit" startIcon={<LogoutRoundedIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ pt: 10, minHeight: "100vh", background: "#F5F7FB" }}>
        <Outlet />
      </Box>
    </>
  );
}