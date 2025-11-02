// src/db/models/config.model.js
export function createConfigTable(db) {
  const stmt = `
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `;
  db.prepare(stmt).run();
}
