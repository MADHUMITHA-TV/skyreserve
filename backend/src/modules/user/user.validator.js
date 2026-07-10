import { body } from "express-validator";


export const updateProfileValidator = [

  body("firstName")
    .optional()
    .notEmpty()
    .withMessage(
      "First name cannot be empty"
    ),


  body("lastName")
    .optional()
    .notEmpty()
    .withMessage(
      "Last name cannot be empty"
    ),


  body("phone")
    .optional()
    .isLength({
      min:10,
      max:15
    })
    .withMessage(
      "Invalid phone number"
    )

];