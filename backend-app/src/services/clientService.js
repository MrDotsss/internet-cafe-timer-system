// src/services/clientService.js
import { getDatabase } from "../db/database.js";

const db = getDatabase();

export const ClientService = {
  getAll() {
    return db.prepare("SELECT * FROM Clients").all();
  },

  getById(id) {
    return db.prepare("SELECT * FROM Clients WHERE id = ?").get(id);
  },

  updateStatus(id, status) {
    db.prepare(
      "UPDATE Clients SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(status, id);
  },

  updateExpiry(id, expiryUtc) {
    db.prepare(
      "UPDATE Clients SET expiryUtc = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(expiryUtc, id);
  },
};
