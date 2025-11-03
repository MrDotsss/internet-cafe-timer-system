// src/db/database.js
import Database from "better-sqlite3";
import config from "config";
import fs from "fs";

let dbInstance = null;

export function getDatabase() {
  if (dbInstance) return dbInstance;

  const dbPath = config.get("database.path");

  // Ensure data directory exists
  const dir = dbPath.substring(0, dbPath.lastIndexOf("/"));
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  dbInstance = new Database(dbPath);
  dbInstance.pragma("journal_mode = WAL");

  console.log(`📀 Database loaded from ${dbPath}`);
  return dbInstance;
}
