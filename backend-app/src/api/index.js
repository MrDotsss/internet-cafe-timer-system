// src/api/index.js
import express from "express";
import clients from "./clients.js";
import sessions from "./sessions.js";
import transactions from "./transactions.js";
import arduino from "./arduino.js";
import config from "./config.js";

const router = express.Router();

router.use("/clients", clients);
router.use("/sessions", sessions);
router.use("/transactions", transactions);
router.use("/arduino", arduino);
router.use("/config", config);

export default router;
