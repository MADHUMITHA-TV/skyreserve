import { body } from "express-validator";


export const airportValidator=[

  body("name")
  .notEmpty()
  .withMessage(
    "Airport name required"
  ),


  body("code")
  .notEmpty()
  .isLength({
    min:3,
    max:10
  })
  .withMessage(
    "Airport code required"
  ),


  body("city")
  .notEmpty()
  .withMessage(
    "City required"
  ),


  body("country")
  .notEmpty()
  .withMessage(
    "Country required"
  )

];