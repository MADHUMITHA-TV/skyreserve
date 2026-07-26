import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

// Supports a single origin or a comma-separated list, e.g.
// CLIENT_URL="https://skyreserve.vercel.app,https://www.skyreserve.com"
const clientUrls = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const env = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT) || 5000,

  clientUrls,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || "7d"
  },

  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",

  seatLockTtl: Number(process.env.SEAT_LOCK_TTL) || 300
};

export default Object.freeze(env);