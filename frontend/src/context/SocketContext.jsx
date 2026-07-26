import { createContext, useEffect, useRef, useState } from "react";
import { connectSocket, disconnectSocket, getSocket } from "../services/socket";
import { getAccessToken } from "../api/axios";
import useAuth from "../hooks/useAuth";

export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [socketId, setSocketId] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      socketRef.current = null;
      setSocketId(null);
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    const socket = connectSocket(token);
    socketRef.current = socket;

    const handleConnect = () => setSocketId(socket.id);
    const handleDisconnect = () => setSocketId(null);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Already connected by the time this effect runs (e.g. fast refresh)
    if (socket.connected) setSocketId(socket.id);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket: getSocket(), socketId }}>
      {children}
    </SocketContext.Provider>
  );
}