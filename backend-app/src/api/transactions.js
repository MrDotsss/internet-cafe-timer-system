// src/api/transactions.js
import express from "express";
import { getDatabase } from "../db/database.js";

const router = express.Router();
const db = getDatabase();

// GET /api/transactions
router.get("/", (req, res) => {
  const result = db
    .prepare("SELECT * FROM Transactions ORDER BY timestampUtc DESC")
    .all();
  res.json(result);
});

export default router;
