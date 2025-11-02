import express from "express";
import { sendToArduino } from "../core/serial.js";
import config from "config";

const router = express.Router();

/**
 * GET current Arduino config
 */
router.get("/config", (req, res) => {
  const payload = {
    port: config.get("arduino.port"),
    baudRate: config.get("arduino.baudRate"),
    minutesPerCoin: config.get("arduino.minutesPerCoin"),
    maxPCs: parseInt(process.env.ARDUINO_MAX_PCS) || 10,
  };
  res.json(payload);
});

/**
 * POST update Arduino config
 */
router.post("/config", (req, res) => {
  const { minutesPerCoin, maxPCs } = req.body;

  if (!minutesPerCoin || !maxPCs) {
    return res
      .status(400)
      .json({ error: "minutesPerCoin and maxPCs required" });
  }

  const payload = {
    type: "config",
    minutesPerCoin,
    maxPCs,
  };

  sendToArduino(payload);
  res.json({ ok: true, sent: payload });
});

export default router;
