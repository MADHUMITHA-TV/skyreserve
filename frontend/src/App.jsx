import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";

import Flights from "./pages/Flights/Flights";

import FlightDetails from "./pages/FlightDetails/FlightDetails";

import AuthLayout from "./layouts/AuthLayout";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import SeatSelection from "./pages/SeatSelection/SeatSelection";

function App() {

  return (

    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/flights"
        element={<Flights />}
      />

      <Route
        path="/flights/:id"
        element={<FlightDetails />}
      />
      <Route
  path="/seat-selection"
  element={<SeatSelection />}
/>
      <Route element={<AuthLayout />}>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />
       
      </Route>
       
    </Routes>

  );

}

export default App;