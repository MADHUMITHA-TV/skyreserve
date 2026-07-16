import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import Flights from "./pages/Flights/Flights";
import FlightDetails from "./pages/FlightDetails/FlightDetails";
import SeatSelection from "./pages/SeatSelection/SeatSelection";
import Booking from "./pages/Booking/Booking";
import Payment from "./pages/Payment/Payment";
import MyBookings from "./pages/MyBookings/MyBookings";
import Profile from "./pages/Profile/Profile";
import Admin from "./pages/Admin/Admin";
import NotFound from "./pages/NotFound/NotFound";

import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/flights" element={<Flights />} />
      <Route path="/flights/:id" element={<FlightDetails />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Requires an authenticated user */}
      <Route element={<ProtectedRoute />}>
        <Route path="/flights/:id/seats" element={<SeatSelection />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/payment/:bookingId" element={<Payment />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Requires an authenticated ADMIN */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<Admin />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
