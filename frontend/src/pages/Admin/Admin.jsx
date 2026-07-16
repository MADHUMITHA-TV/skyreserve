import { useState } from "react";
import { Box, Container, Typography, Tabs, Tab, Stack } from "@mui/material";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import UsersTab from "./tabs/UsersTab";
import AirlinesTab from "./tabs/AirlinesTab";
import AirportsTab from "./tabs/AirportsTab";
import AircraftTab from "./tabs/AircraftTab";
import FlightsTab from "./tabs/FlightsTab";

const TABS = [
  { label: "Users", component: <UsersTab /> },
  { label: "Flights", component: <FlightsTab /> },
  { label: "Airlines", component: <AirlinesTab /> },
  { label: "Airports", component: <AirportsTab /> },
  { label: "Aircraft", component: <AircraftTab /> },
];

export default function Admin() {
  const [tab, setTab] = useState(0);

  return (
    <>
      <Navbar />

      <Box sx={{ pt: 12, pb: 8, background: "#F5F7FB", minHeight: "100vh" }}>
        <Container maxWidth="xl">
          <Stack direction="row" spacing={2} alignItems="center" mb={1}>
            <AdminPanelSettingsRoundedIcon color="primary" sx={{ fontSize: 34 }} />
            <Typography variant="h4" fontWeight={700}>
              Admin Panel
            </Typography>
          </Stack>

          <Typography color="text.secondary" mb={4}>
            Manage users, flights, airlines, airports and aircraft.
          </Typography>

          <Tabs
            value={tab}
            onChange={(e, value) => setTab(value)}
            sx={{ mb: 3 }}
            variant="scrollable"
            scrollButtons="auto"
          >
            {TABS.map((t) => (
              <Tab key={t.label} label={t.label} />
            ))}
          </Tabs>

          {TABS[tab].component}
        </Container>
      </Box>

      <Footer />
    </>
  );
}
