// src/db/models/pcs.model.js
export function createPCsTable(db) {
  const stmt = `
    CREATE TABLE IF NOT EXISTS pcs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT,
      macAddress TEXT,
      expiryUtc INTEGER,
      status TEXT DEFAULT 'idle'
    )
  `;
  db.prepare(stmt).run();
}
