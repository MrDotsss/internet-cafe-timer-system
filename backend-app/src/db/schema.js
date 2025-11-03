// src/db/schema.js
import { getDatabase } from "./database.js";

export function initializeSchema() {
  const db = getDatabase();

  db.exec(`
    CREATE TABLE IF NOT EXISTS Clients (
      id INTEGER PRIMARY KEY,
      name TEXT,
      macAddress TEXT UNIQUE,
      ipAddress TEXT,
      status TEXT DEFAULT 'offline',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pcId INTEGER,
      startUtc TEXT,
      endUtc TEXT,
      expiryUtc TEXT,
      durationMinutes INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      FOREIGN KEY (pcId) REFERENCES Clients(id)
    );

    CREATE TABLE IF NOT EXISTS Transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pcId INTEGER,
      sessionId INTEGER,
      source TEXT,
      amount REAL,
      minutesAdded INTEGER,
      timestampUtc TEXT,
      notes TEXT,
      FOREIGN KEY (pcId) REFERENCES Clients(id),
      FOREIGN KEY (sessionId) REFERENCES Sessions(id)
    );

    CREATE TABLE IF NOT EXISTS Config (
      key TEXT PRIMARY KEY,
      value TEXT,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("✅ Database schema initialized");
}
