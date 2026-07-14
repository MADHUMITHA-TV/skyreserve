import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Authenticate socket connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET
      );

      socket.userId = decoded.id;

      next();
    } catch (err) {
      return next(new Error("Invalid Token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `✅ User Connected: ${socket.userId}`
    );

    socket.on("disconnect", () => {
      console.log(
        `❌ User Disconnected: ${socket.userId}`
      );
    });
  });

  return io;
};

export const getIO = () => io;