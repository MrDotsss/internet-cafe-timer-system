// src/api/sessions.js
import express from "express";
import { SessionService } from "../services/sessionService.js";

const router = express.Router();

// GET /api/sessions
router.get("/", (req, res) => {
  res.json(SessionService.getAllActiveSessions());
});

// GET /api/sessions/:pcId/remaining
router.get("/:pcId/remaining", (req, res) => {
  const { pcId } = req.params;
  const session = SessionService.getActiveSession(pcId);

  if (!session) {
    return res.status(404).json({ error: "No active session found" });
  }

  if (!session.expiryUtc) {
    return res.json({ remainingMinutes: 0, remainingSeconds: 0 });
  }

  const now = new Date();
  const expiry = new Date(session.expiryUtc);
  const diffMs = expiry - now;
  const remainingSeconds = Math.max(Math.floor(diffMs / 1000), 0);
  const remainingMinutes = Math.floor(remainingSeconds / 60);

  res.json({
    pcId: Number(pcId),
    remainingMinutes,
    remainingSeconds,
    expiryUtc: session.expiryUtc,
  });
});

// POST /api/sessions/:pcId/extend
router.post("/:pcId/extend", (req, res) => {
  const { minutes, source, amount } = req.body;
  SessionService.extendSession(
    parseInt(req.params.pcId),
    minutes,
    source,
    amount
  );
  res.json({ success: true });
});

export default router;
