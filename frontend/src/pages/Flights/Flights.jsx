import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

import {
  Box,
  Container,
} from "@mui/material";

import FlightSearchForm from "../../components/flights/FlightSearchForm";
import FlightList from "../../components/flights/FlightList";

export default function Flights() {
  return (
    <>
      <Navbar />

      <Box
        sx={{
          pt: 14,
          pb: 8,
          background: "#F5F7FB",
          minHeight: "100vh",
        }}
      >
        <Container maxWidth="xl">

          <FlightSearchForm />

          <FlightList />

        </Container>
      </Box>

      <Footer />
    </>
  );
}