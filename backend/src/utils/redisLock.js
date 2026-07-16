import redis from "../config/redis.js";
import { v4 as uuidv4 } from "uuid";
const LOCK_TTL =
  Number(process.env.SEAT_LOCK_TTL) || 300;// 5 minutes

export const lockSeat = async (seatId, userId) => {
  const key = `seat-lock:${seatId}`;

  const token = uuidv4();

  const value = JSON.stringify({
    userId,
    token
  });

  const result = await redis.set(
    key,
    value,
    {
      NX: true,
      EX: LOCK_TTL
    }
  );

  if (result !== "OK") {
    return null;
  }

  return {
    userId,
    token
  };
};
export const unlockSeat = async (
  seatId,
  token
) => {
  const key = `seat-lock:${seatId}`;

  const lua = `
    local value = redis.call("GET", KEYS[1])

    if not value then
      return 0
    end

    local data = cjson.decode(value)

    if data.token == ARGV[1] then
      return redis.call("DEL", KEYS[1])
    end

    return 0
  `;

  return await redis.eval(
    lua,
    {
      keys: [key],
      arguments: [token]
    }
  );
};
export const isSeatLocked = async (seatId) => {
  const key = `seat-lock:${seatId}`;

  return (await redis.exists(key)) === 1;
};

export const getSeatLockOwner = async (seatId) => {
  const key = `seat-lock:${seatId}`;

  const value = await redis.get(key);

  if (!value) return null;

  return JSON.parse(value);
};
export const getSeatLockTTL = async (seatId) => {
  const key = `seat-lock:${seatId}`;

  return await redis.ttl(key);
};

export const extendSeatLock = async (
  seatId,
  seconds = LOCK_TTL
) => {
  const key = `seat-lock:${seatId}`;

  return await redis.expire(key, seconds);
};

export const forceUnlockSeat = async (seatId) => {
  const key = `seat-lock:${seatId}`;
  return await redis.del(key);
};