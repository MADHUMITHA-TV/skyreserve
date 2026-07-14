import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";

import {
  create,
  findMyBookings,
  findOne,
  lockSeat,
  unlockSeat,
  seatLockStatus,
  refreshLock,
  cancel
} from "./booking.controller.js";

import { createBookingValidator } from "./booking.validator.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  createBookingValidator,
  create
);

router.get(
  "/",
  authMiddleware,
  findMyBookings
);
router.patch(
  "/:id/cancel",
  authMiddleware,
  cancel
);
router.get(
  "/:id",
  authMiddleware,
  findOne
);

router.post(
  "/unlock/:seatId",
  authMiddleware,
  unlockSeat
);

router.get(
  "/lock/:seatId",
  authMiddleware,
  seatLockStatus
);

router.post(
  "/lock/:seatId",
  authMiddleware,
  lockSeat
);

router.put(
  "/lock/:seatId",
  authMiddleware,
  refreshLock
);


export default router;