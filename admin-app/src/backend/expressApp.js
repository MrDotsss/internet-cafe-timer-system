// File: src/backend/expressApp.js
// ESM module - starts an Express + Socket.IO server inside Electron main process.
// Lightweight in-memory session/client management for Phase 2.

import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import EventEmitter from "events";

const DEFAULT_PORT = process.env.ADMIN_PORT
  ? Number(process.env.ADMIN_PORT)
  : 3030;

class Backend extends EventEmitter {
  constructor() {
    super();
    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.io = new IOServer(this.httpServer, {
      cors: { origin: "*" }, // LAN usage — adjust for production (CORS / auth)
    });

    // In-memory stores (replace with SQLite later)
    this.clients = new Map(); // key: clientId (socket id or pc id), value: { pc, status, session }
    this.sessions = new Map(); // key: sessionId, value: { pc, startAt (utc ms), endAt (utc ms) }
    this.nextSessionId = 1;

    this._attachRoutes();
    this._attachSocketHandlers();
  }

  _attachRoutes() {
    this.app.use(express.json());

    // Health / quick status
    this.app.get("/status", (req, res) => {
      res.json({
        ok: true,
        clients: Array.from(this.clients.values()),
        sessions: Array.from(this.sessions.values()),
      });
    });

    // Admin endpoint to add time to a PC
    this.app.post("/add-time", (req, res) => {
      const { pc, minutes } = req.body;
      if (typeof pc === "undefined" || typeof minutes !== "number") {
        return res
          .status(400)
          .json({ ok: false, message: "pc and minutes required" });
      }
      const result = this.addTimeToPc(pc, minutes);
      return res.json({ ok: true, result });
    });

    // Admin endpoint to lock/unlock/shutdown a PC (these call socket events)
    this.app.post("/control", (req, res) => {
      const { pc, action } = req.body; // action: lock | unlock | shutdown | ping
      if (!pc || !action) return res.status(400).json({ ok: false });
      this.controlPc(pc, action);
      return res.json({ ok: true });
    });
  }

  _attachSocketHandlers() {
    this.io.on("connection", (socket) => {
      // expect clients to emit an "introduce" with { pc } so we can map socket to pc id
      socket.on("introduce", (payload) => {
        const { pc } = payload || {};
        const id = pc ?? socket.id;
        this.clients.set(id, {
          id,
          socketId: socket.id,
          pc,
          status: "connected",
        });
        this.emit("client_connected", { id, pc });
        this.io.emit("client_update", { id, pc, status: "connected" });
      });

      // client requests current sessions (on reconnect)
      socket.on("request_sync", () => {
        socket.emit("sync_sessions", Array.from(this.sessions.values()));
      });

      // client heartbeat or updates
      socket.on("heartbeat", (payload) => {
        const { pc, now } = payload || {};
        const id = pc ?? socket.id;
        const record = this.clients.get(id);
        if (record) {
          record.lastSeen = now ?? Date.now();
          this.clients.set(id, record);
        }
      });

      // client disconnected
      socket.on("disconnect", () => {
        // find client by socketId
        for (const [id, client] of this.clients.entries()) {
          if (client.socketId === socket.id) {
            client.status = "disconnected";
            this.clients.set(id, client);
            this.emit("client_disconnected", client);
            this.io.emit("client_update", client);
            break;
          }
        }
      });

      // handle commands from client (like ack)
      socket.on("client_ack", (payload) => {
        // payload: { pc, action, ok }
        this.emit("client_ack", payload);
      });
    });
  }

  /**
   * Start the HTTP + Socket.IO server on given port
   * @param {number} port
   */
  async start(port = DEFAULT_PORT) {
    return new Promise((resolve, reject) => {
      this.httpServer.listen(port, (err) => {
        if (err) return reject(err);
        this.port = port;
        this.emit("started", { port });
        resolve({ port });
      });
    });
  }

  /**
   * Stop server
   */
  async stop() {
    return new Promise((resolve, reject) => {
      this.io.close(() => {
        this.httpServer.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  /**
   * Add time to a PC (date-time based)
   * Implementation: create a session or extend existing session for that PC.
   */
  addTimeToPc(pc, minutes) {
    const now = Date.now();
    // find active session for pc
    let session = Array.from(this.sessions.values()).find(
      (s) => s.pc === pc && s.endAt > now
    );
    if (session) {
      // extend endAt
      session.endAt += minutes * 60_000;
    } else {
      // create new session
      const id = `s_${this.nextSessionId++}`;
      session = {
        id,
        pc,
        startAt: now,
        endAt: now + minutes * 60_000,
      };
      this.sessions.set(id, session);
    }

    // notify connected client (if present)
    const client =
      this.clients.get(pc) ||
      Array.from(this.clients.values()).find((c) => c.pc === pc);
    if (client && client.socketId) {
      this.io.to(client.socketId).emit("session_assigned", session);
    }
    // emit update to admin UI
    this.emit("session_update", session);
    this.io.emit("session_update", session);
    return session;
  }

  /**
   * Generic control to client (lock/unlock/shutdown)
   */
  controlPc(pc, action) {
    const client =
      this.clients.get(pc) ||
      Array.from(this.clients.values()).find((c) => c.pc === pc);
    if (!client) {
      // still emit event for UI to show attempt
      this.emit("control_attempt", {
        pc,
        action,
        ok: false,
        reason: "client_not_found",
      });
      return false;
    }
    this.io.to(client.socketId).emit("control", { action });
    this.emit("control_attempt", { pc, action, ok: true });
    return true;
  }

  /**
   * Utility: broadcast config to hardware or listeners
   */
  broadcastConfig(config) {
    // example config: { maxPCs, minutesPerCoin }
    this.io.emit("config_update", config);
    this.emit("config_update", config);
  }
}

let backendInstance = null;

export function createBackend() {
  if (!backendInstance) backendInstance = new Backend();
  return backendInstance;
}

export async function startBackend(port = DEFAULT_PORT) {
  const b = createBackend();
  return b.start(port);
}

export default {
  createBackend,
  startBackend,
};
