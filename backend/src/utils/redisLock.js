import redis from "../config/redis.js";
import { v4 as uuidv4 } from "uuid";

const LOCK_TTL =
  Number(process.env.SEAT_LOCK_TTL) || 300; // 5 minutes

export const lockSeat = async (seatId, userId, socketId = null) => {
  const key = `seat-lock:${seatId}`;

  const token = uuidv4();

  const value = JSON.stringify({
    userId,
    token,
    socketId
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

  // Track this lock against the socket that opened it, so a dropped
  // connection can release everything that socket was holding.
  if (socketId) {
    const socketKey = `socket-locks:${socketId}`;
    await redis.hSet(socketKey, seatId, token);
    await redis.expire(socketKey, LOCK_TTL);
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

  // Atomically: delete the lock only if the token still matches, and if
  // the lock was tied to a socket, remove it from that socket's index too.
  const lua = `
    local value = redis.call("GET", KEYS[1])

    if not value then
      return 0
    end

    local data = cjson.decode(value)

    if data.token == ARGV[1] then
      redis.call("DEL", KEYS[1])

      if data.socketId then
        redis.call("HDEL", "socket-locks:" .. data.socketId, ARGV[2])
      end

      return 1
    end

    return 0
  `;

  return await redis.eval(
    lua,
    {
      keys: [key],
      arguments: [token, seatId]
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

  const value = await redis.get(key);

  const extended = await redis.expire(key, seconds);

  // Keep the socket's index alive for as long as the lock itself.
  if (value) {
    const data = JSON.parse(value);
    if (data.socketId) {
      await redis.expire(`socket-locks:${data.socketId}`, seconds);
    }
  }

  return extended;
};

export const forceUnlockSeat = async (seatId) => {
  const key = `seat-lock:${seatId}`;

  const value = await redis.get(key);

  if (value) {
    const data = JSON.parse(value);
    if (data.socketId) {
      await redis.hDel(`socket-locks:${data.socketId}`, seatId);
    }
  }

  return await redis.del(key);
};

// Called from the socket disconnect handler. Releases every seat lock
// this socket was holding and returns the seat IDs that were freed, so
// the caller can broadcast the change to other connected clients.
export const releaseLocksForSocket = async (socketId) => {
  const socketKey = `socket-locks:${socketId}`;

  const locks = await redis.hGetAll(socketKey);
  const seatIds = Object.keys(locks);

  for (const seatId of seatIds) {
    await unlockSeat(seatId, locks[seatId]);
  }

  await redis.del(socketKey);

  return seatIds;
};