import { body } from "express-validator";

export const flightValidator = [
  body("flightNumber")
    .trim()
    .notEmpty()
    .withMessage("Flight number is required"),

  body("departureTime")
    .notEmpty()
    .isISO8601()
    .withMessage("Valid departure time is required"),

  body("arrivalTime")
    .notEmpty()
    .isISO8601()
    .withMessage("Valid arrival time is required"),

  body("airlineId")
    .notEmpty()
    .withMessage("Airline is required"),

  body("aircraftId")
    .notEmpty()
    .withMessage("Aircraft is required"),

  body("departureAirportId")
    .notEmpty()
    .withMessage("Departure airport is required"),

  body("arrivalAirportId")
    .notEmpty()
    .withMessage("Arrival airport is required")
];