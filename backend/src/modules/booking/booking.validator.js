import { body } from "express-validator";

export const createBookingValidator = [
  body("flightId")
    .notEmpty()
    .withMessage("Flight ID is required")
    .isString()
    .withMessage("Flight ID must be a string"),

  body("passengers")
    .isArray({ min: 1, max: 9 })
    .withMessage("Passengers must contain between 1 and 9 passengers"),

  body("passengers.*.firstName")
    .trim()
    .notEmpty()
    .withMessage("Passenger first name is required")
    .isLength({ max: 100 })
    .withMessage("First name cannot exceed 100 characters"),

  body("passengers.*.lastName")
    .trim()
    .notEmpty()
    .withMessage("Passenger last name is required")
    .isLength({ max: 100 })
    .withMessage("Last name cannot exceed 100 characters"),

  body("passengers.*.age")
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage("Age must be between 0 and 120"),

  body("passengers.*.gender")
    .optional()
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("Invalid gender")
];