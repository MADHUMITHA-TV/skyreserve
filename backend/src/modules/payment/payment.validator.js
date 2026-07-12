import { body } from "express-validator";

export const createPaymentValidator = [

  body("bookingId")
    .trim()
    .notEmpty()
    .withMessage("Booking ID is required")

    .isString()
    .withMessage("Booking ID must be a string"),

  body("paymentMethod")
    .trim()
    .notEmpty()
    .withMessage("Payment method is required")

    .isIn([
      "CARD",
      "UPI",
      "NET_BANKING",
      "WALLET"
    ])
    .withMessage(
      "Payment method must be CARD, UPI, NET_BANKING or WALLET"
    )

];

export const payValidator = [

  body("transactionId")
    .trim()
    .notEmpty()
    .withMessage("Transaction ID is required")

    .isLength({
      min: 5,
      max: 100
    })
    .withMessage(
      "Transaction ID must be between 5 and 100 characters"
    )

];