// src/db/index.js
import { createConnection } from "./connection.js";
import { createPCsTable } from "./models/pcs.model.js";
import { createTransactionsTable } from "./models/transactions.model.js";
import { createConfigTable } from "./models/config.model.js";

let dbInstance = null;

export function initDatabase() {
  const db = createConnection();
  createPCsTable(db);
  createTransactionsTable(db);
  createConfigTable(db);
  dbInstance = db;
  console.log("✅ Database initialized.");
}

export function getDB() {
  if (!dbInstance) throw new Error("Database not initialized!");
  return dbInstance;
}
