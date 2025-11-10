// src/sockets/socketManager.js
import { SOCKET_EVENTS } from "./events.js";

let ioInstance = null;

export function setupSocket(io) {
  ioInstance = io;

  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    console.log(`⚡ Client connected: ${socket.id}`);

    socket.on(SOCKET_EVENTS.ADMIN_JOIN, () => {
      socket.join("admins");
      console.log("👑 Admin joined room");
    });

    socket.on(SOCKET_EVENTS.CLIENT_JOIN, (pcId) => {
      socket.join(`pc-${pcId}`);
      console.log(`🖥️ Client joined room pc-${pcId}`);
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
}

/**
 * Emit helpers — triggered by services (admin actions, Arduino, expiry)
 */
export const SocketEmit = {
  clientJoin(client) {
    ioInstance?.emit(SOCKET_EVENTS.CLIENT_JOIN, client);
  },

  clientUpdate(client) {
    ioInstance?.emit(SOCKET_EVENTS.CLIENT_UPDATE, client);
  },

  clientExpired(clientId) {
    ioInstance?.emit(SOCKET_EVENTS.CLIENT_EXPIRED, { id: clientId });
  },

  sessionStart(pcId) {
    ioInstance?.emit(SOCKET_EVENTS.SESSION_START, { pcId });
  },

  sessionEnd(pcId) {
    ioInstance?.emit(SOCKET_EVENTS.SESSION_END, { pcId });
  },

  sessionExtend(pcId, minutes) {
    ioInstance?.emit(SOCKET_EVENTS.SESSION_EXTEND, { pcId, minutes });
  },
};
