import { body } from "express-validator";


export const aircraftValidator=[


body("model")
.notEmpty()
.withMessage(
"Aircraft model required"
),



body("registrationNumber")
.notEmpty()
.withMessage(
"Registration number required"
),



body("totalSeats")
.isInt({
min:1
})
.withMessage(
"Total seats must be valid"
),



body("airlineId")
.notEmpty()
.withMessage(
"Airline required"
)


];