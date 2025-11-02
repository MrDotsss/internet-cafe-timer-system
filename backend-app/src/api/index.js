// src/api/index.js
import express from "express";
import clients from "./clients.js";
import sessions from "./sessions.js";
import transactions from "./transactions.js";

const router = express.Router();

router.use("/clients", clients);
router.use("/sessions", sessions);
router.use("/transactions", transactions);

export default router;
