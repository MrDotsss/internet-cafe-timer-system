// src/api/clients.js
import express from "express";
import { ClientService } from "../services/clientService.js";
import { SessionService } from "../services/sessionService.js";

const router = express.Router();

// GET /api/clients
router.get("/", (req, res) => {
  res.json(ClientService.getAll());
});

// GET /api/clients/:id
router.get("/:id", (req, res) => {
  const client = ClientService.getById(req.params.id);
  if (!client) return res.status(404).json({ error: "Client not found" });
  res.json(client);
});

// PATCH /api/clients/:id/status
router.patch("/:id/status", (req, res) => {
  const { status } = req.body;
  ClientService.updateStatus(req.params.id, status);
  res.json({ success: true });
});

// POST /api/clients/:id/start
router.post("/:id/start", (req, res) => {
  const sessionId = SessionService.startSession(req.params.id);
  res.json({ success: true, sessionId });
});

// POST /api/clients/:id/end
router.post("/:id/end", (req, res) => {
  SessionService.endSession(req.params.id);
  res.json({ success: true });
});

export default router;
