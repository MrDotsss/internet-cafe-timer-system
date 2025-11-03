import express from "express";
import { getConfig, setConfig } from "../services/configService.js";

const router = express.Router();

// GET /api/config
router.get("/", (req, res) => {
  res.json(getConfig());
});

// GET /api/config/:key
router.get("/:key", (req, res) => {
  const value = getConfig(req.params.key);
  if (value === undefined)
    return res.status(404).json({ error: "Config not found" });
  res.json({ key: req.params.key, value });
});

// PATCH /api/config/:key
router.patch("/:key", (req, res) => {
  const { value } = req.body;
  if (value === undefined)
    return res.status(400).json({ error: "Value required" });

  const updated = setConfig(req.params.key, value);
  res.json({ key: req.params.key, value: updated });
});

export default router;
