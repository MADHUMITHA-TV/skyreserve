import { body } from "express-validator";


export const registerValidator = [
  body("firstName")
    .notEmpty()
    .withMessage("First name required"),

  body("lastName")
    .notEmpty()
    .withMessage("Last name required"),

  body("email")
    .isEmail()
    .withMessage("Valid email required"),

  body("password")
    .isLength({
      min: 6
    })
    .withMessage(
      "Password must contain minimum 6 characters"
    )
];