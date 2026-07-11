import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";

import {
  findSeats,
  findAvailableSeats
} from "./flightSeat.controller.js";

const router = Router();

router.get(
  "/:flightId/seats",
  authMiddleware,
  findSeats
);

router.get(
  "/:flightId/seats/available",
  authMiddleware,
  findAvailableSeats
);

export default router;