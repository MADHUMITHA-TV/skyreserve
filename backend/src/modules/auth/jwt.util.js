import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  const secret =
    process.env.JWT_ACCESS_SECRET ||
    process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT secret is not configured");
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    secret,
    {
      expiresIn: "15m",
    }
  );
};