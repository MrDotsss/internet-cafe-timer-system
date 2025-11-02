// src/db/models/transactions.model.js
export function createTransactionsTable(db) {
  const stmt = `
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pcId INTEGER,
      minutesAdded INTEGER,
      source TEXT,
      timestamp INTEGER,
      FOREIGN KEY(pcId) REFERENCES pcs(id)
    )
  `;
  db.prepare(stmt).run();
}
