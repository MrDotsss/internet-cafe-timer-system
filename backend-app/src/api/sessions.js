// src/api/sessions.js
import express from "express";
import { SessionService } from "../services/sessionService.js";

const router = express.Router();

// GET /api/sessions
router.get("/", (req, res) => {
  res.json(SessionService.getActiveSessions());
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
