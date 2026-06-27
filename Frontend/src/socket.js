import { io } from "socket.io-client";
import { logger } from "./Util/logger";

const trimTrailingSlash = (url) => url.replace(/\/+$/, "");
const SOCKET_URL = trimTrailingSlash(import.meta.env.VITE_SOCKET_URL || "https://ethioludo.gameit.in");

const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

socket.on("connect", () => {
  logger.info("Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  logger.info("Socket disconnected:", reason);
});

socket.on("connect_error", (error) => {
  logger.error("Socket connection error:", error.message);
});

export default socket;
