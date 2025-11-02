// src/sockets/events.js
export const SOCKET_EVENTS = {
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  ADMIN_JOIN: "admin:join",
  CLIENT_JOIN: "client:join",
  CLIENT_UPDATE: "client:update",
  CLIENT_EXPIRED: "client:expired",
  SESSION_START: "session:start",
  SESSION_END: "session:end",
  SESSION_EXTEND: "session:extend",
};
