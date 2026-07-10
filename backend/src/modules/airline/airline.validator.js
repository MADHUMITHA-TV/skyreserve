import { body } from "express-validator";


export const airlineValidator=[


body("name")
.notEmpty()
.withMessage(
"Airline name required"
),


body("code")
.notEmpty()
.isLength({
min:2,
max:10
})
.withMessage(
"Airline code required"
)


];