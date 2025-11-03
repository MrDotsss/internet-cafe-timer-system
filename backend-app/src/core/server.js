// src/core/server.js
import express from "express";
import http from "http";
import { Server as SocketServer } from "socket.io";
import cors from "cors";

export function createServer(config) {
  const app = express();
  const httpServer = http.createServer(app);
  const io = new SocketServer(httpServer, { cors: { origin: "*" } });

  app.use(cors());
  app.use(express.json());

  return { app, httpServer, io };
}
