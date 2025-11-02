// src/db/connection.js
import Database from "better-sqlite3";
import config from "config";
import fs from "fs";
import path from "path";

export function createConnection() {
  const dbPath = config.get("database.path");
  const fullPath = path.resolve(dbPath);

  // Ensure directory exists
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });

  const db = new Database(fullPath);
  db.pragma("journal_mode = WAL"); // improves durability
  console.log(`🗃️  Connected to database: ${fullPath}`);

  return db;
}
