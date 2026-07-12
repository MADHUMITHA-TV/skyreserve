import { Router } from "express";


import {
  authRoutes
} from "../modules/auth/index.js";


import userRoutes 
from "../modules/user/user.routes.js";


import adminRoutes
from "../modules/admin/admin.routes.js";

import airportRoutes
from "../modules/airport/airport.routes.js";

import airlineRoutes
from "../modules/airline/airline.routes.js";

import aircraftRoutes
from "../modules/aircraft/aircraft.routes.js";
import flightRoutes from "../modules/flight/flight.routes.js";
import { bookingRoutes } from "../modules/booking/index.js";
import { flightSeatRoutes } from "../modules/flightSeat/index.js";
import paymentRoutes from "../modules/payment/payment.routes.js";
const router = Router();



router.use(
  "/auth",
  authRoutes
);



router.use(
  "/users",
  userRoutes
);



router.use(
  "/admin",
  adminRoutes
);

router.use(
  "/airports",
  airportRoutes
);

router.use(
  "/airlines",
  airlineRoutes
);

router.use(
  "/aircrafts",
  aircraftRoutes
);

router.use("/flights", flightRoutes);
router.use("/bookings", bookingRoutes);
router.use("/flights", flightSeatRoutes);
router.use(
  "/payments",
  paymentRoutes
);
export default router;