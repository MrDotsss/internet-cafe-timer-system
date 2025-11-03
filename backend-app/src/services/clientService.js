import { getDatabase } from "../db/database.js";

const db = getDatabase();

export const ClientService = {
  getAll() {
    return db.prepare("SELECT * FROM Clients").all();
  },

  getById(id) {
    return db.prepare("SELECT * FROM Clients WHERE id = ?").get(id);
  },

  getByMac(macAddress) {
    return db
      .prepare("SELECT * FROM Clients WHERE macAddress = ?")
      .get(macAddress);
  },

  updateInfo(id, { name, macAddress, ipAddress }) {
    db.prepare(
      `UPDATE Clients
       SET name = COALESCE(?, name),
           macAddress = COALESCE(?, macAddress),
           ipAddress = COALESCE(?, ipAddress),
           updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).run(name, macAddress, ipAddress, id);
  },

  updateStatus(id, status) {
    db.prepare(
      "UPDATE Clients SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(status, id);
  },

  upsert({ id, name, macAddress, ipAddress }) {
    const existing = this.getById(id);
    if (existing) {
      // Update info fields only
      db.prepare(
        "UPDATE Clients SET name = ?, macAddress = ?, ipAddress = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?"
      ).run(name, macAddress, ipAddress, id);
    } else {
      // Insert new client with manual id
      db.prepare(
        "INSERT INTO Clients (id, name, macAddress, ipAddress, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, 'idle', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
      ).run(id, name, macAddress, ipAddress);
    }
    return id;
  },
};
