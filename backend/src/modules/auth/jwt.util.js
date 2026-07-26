import jwt from "jsonwebtoken";

import config from "../../config/index.js";

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    config.env.jwt.accessSecret,
    {
      expiresIn: "15m"
    }
  );
};