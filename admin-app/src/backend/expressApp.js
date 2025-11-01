// File: src/backend/expressApp.js

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
      cors: { origin: "*" },
    });

    this.clients = new Map(); // connected PCs
    this.sessions = new Map(); // session data
    this.nextSessionId = 1;

    // Phase 3 addition:
    this._tickInterval = null;
    this._tickRateMs = 1000; // tick every second
    this._attachRoutes();
    this._attachSocketHandlers();
  }

  // ------------------------------------------
  // Routes
  // ------------------------------------------
  _attachRoutes() {
    this.app.use(express.json());

    this.app.get("/status", (req, res) => {
      res.json({
        ok: true,
        sessions: Array.from(this.sessions.values()),
        clients: Array.from(this.clients.values()),
      });
    });

    this.app.post("/add-time", (req, res) => {
      const { pc, minutes } = req.body;
      if (typeof pc === "undefined" || typeof minutes !== "number") {
        return res.status(400).json({ ok: false, message: "invalid params" });
      }
      const result = this.addTimeToPc(pc, minutes);
      return res.json({ ok: true, result });
    });

    this.app.post("/control", (req, res) => {
      const { pc, action } = req.body;
      if (!pc || !action) return res.status(400).json({ ok: false });
      this.controlPc(pc, action);
      return res.json({ ok: true });
    });
  }

  // ------------------------------------------
  // Sockets
  // ------------------------------------------
  _attachSocketHandlers() {
    this.io.on("connection", (socket) => {
      socket.on("introduce", (payload) => {
        const { pc } = payload || {};
        const id = pc ?? socket.id;
        this.clients.set(id, {
          id,
          socketId: socket.id,
          pc,
          status: "connected",
          lastSeen: Date.now(),
        });

        this.io.emit("client_update", { id, pc, status: "connected" });
        this.emit("client_connected", { id, pc });
      });

      socket.on("request_sync", () => {
        socket.emit("sync_sessions", Array.from(this.sessions.values()));
      });

      socket.on("heartbeat", ({ pc }) => {
        const id = pc ?? socket.id;
        const record = this.clients.get(id);
        if (record) record.lastSeen = Date.now();
      });

      socket.on("disconnect", () => {
        for (const [id, client] of this.clients.entries()) {
          if (client.socketId === socket.id) {
            client.status = "disconnected";
            this.clients.set(id, client);
            this.io.emit("client_update", client);
            this.emit("client_disconnected", client);
            break;
          }
        }
      });
    });
  }

  // ------------------------------------------
  // Lifecycle
  // ------------------------------------------
  async start(port = DEFAULT_PORT) {
    return new Promise((resolve, reject) => {
      this.httpServer.listen(port, (err) => {
        if (err) return reject(err);
        this.port = port;
        this._startTicker();
        this.emit("started", { port });
        resolve({ port });
      });
    });
  }

  async stop() {
    clearInterval(this._tickInterval);
    return new Promise((resolve, reject) => {
      this.io.close(() => {
        this.httpServer.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  }

  // ------------------------------------------
  // Core Session Methods
  // ------------------------------------------
  addTimeToPc(pc, minutes) {
    const now = Date.now();
    let session = Array.from(this.sessions.values()).find(
      (s) => s.pc === pc && s.endAt > now
    );

    if (session) {
      session.endAt += minutes * 60_000;
    } else {
      const id = `s_${this.nextSessionId++}`;
      session = {
        id,
        pc,
        startAt: now,
        endAt: now + minutes * 60_000,
        status: "active",
      };
      this.sessions.set(id, session);
    }

    // notify connected client
    this._emitSessionUpdate(session);
    return session;
  }

  controlPc(pc, action) {
    const client =
      this.clients.get(pc) ||
      Array.from(this.clients.values()).find((c) => c.pc === pc);

    if (!client) {
      this.emit("control_attempt", { pc, action, ok: false });
      return false;
    }
    this.io.to(client.socketId).emit("control", { action });
    this.emit("control_attempt", { pc, action, ok: true });
    return true;
  }

  broadcastConfig(config) {
    this.io.emit("config_update", config);
    this.emit("config_update", config);
  }

  // ------------------------------------------
  // Timer Manager
  // ------------------------------------------
  _startTicker() {
    if (this._tickInterval) clearInterval(this._tickInterval);
    this._tickInterval = setInterval(() => this._tick(), this._tickRateMs);
  }

  _tick() {
    const now = Date.now();
    for (const [id, s] of this.sessions.entries()) {
      if (s.status === "active" && now >= s.endAt) {
        s.status = "expired";
        this.sessions.set(id, s);
        this.io.emit("session_expired", { id: s.id, pc: s.pc });
        this._emitSessionUpdate(s);

        // optional: auto-lock client
        this.controlPc(s.pc, "lock");
      }
    }
  }

  _emitSessionUpdate(session) {
    this.io.emit("session_update", session);
    this.emit("session_update", session);
  }
}

// ------------------------------------------
// Singleton export
// ------------------------------------------
let backendInstance = null;
export function createBackend() {
  if (!backendInstance) backendInstance = new Backend();
  return backendInstance;
}
export async function startBackend(port = DEFAULT_PORT) {
  const b = createBackend();
  return b.start(port);
}
export default { createBackend, startBackend };
