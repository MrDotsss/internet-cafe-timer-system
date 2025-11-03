// src/services/transactionService.js
import { getDatabase } from "../db/database.js";

const db = getDatabase();

export const TransactionService = {
  log(pcId, sessionId, source, amount, minutesAdded, notes = null) {
    db.prepare(
      `INSERT INTO Transactions
       (pcId, sessionId, source, amount, minutesAdded, timestampUtc, notes)
       VALUES (?, ?, ?, ?, ?, DATETIME('now'), ?)`
    ).run(pcId, sessionId, source, amount, minutesAdded, notes);
  },
};
