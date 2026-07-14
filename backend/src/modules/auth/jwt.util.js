import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("JWT_ACCESS_SECRET:", process.env.JWT_ACCESS_SECRET);
  console.log("JWT_REFRESH_SECRET:", process.env.JWT_REFRESH_SECRET);

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "15m"
    }
  );
};