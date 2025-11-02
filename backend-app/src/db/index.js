// src/db/index.js
import { getDatabase } from "./database.js";
import { initializeSchema } from "./schema.js";

export function initDatabase() {
  const db = getDatabase();
  initializeSchema();
  return db;
}
