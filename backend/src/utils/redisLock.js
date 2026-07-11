import redis from "../config/redis.js";

const LOCK_TTL = 300; // 5 minutes

export const lockSeat = async (seatId, userId) => {
  const key = `seat-lock:${seatId}`;

  const result = await redis.set(
    key,
    userId,
    {
      NX: true,
      EX: LOCK_TTL
    }
  );

  return result === "OK";
};

export const unlockSeat = async (seatId) => {
  const key = `seat-lock:${seatId}`;

  await redis.del(key);
};

export const isSeatLocked = async (seatId) => {
  const key = `seat-lock:${seatId}`;

  return (await redis.exists(key)) === 1;
};

export const getSeatLockOwner = async (seatId) => {
  const key = `seat-lock:${seatId}`;

  return await redis.get(key);
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