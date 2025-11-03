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

  create({ name, macAddress, ipAddress }) {
    const result = db
      .prepare(
        `INSERT INTO Clients (name, macAddress, ipAddress, status)
         VALUES (?, ?, ?, 'idle')`
      )
      .run(name, macAddress, ipAddress);
    return result.lastInsertRowid;
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

  upsert({ name, macAddress, ipAddress }) {
    const existing = this.getByMac(macAddress);
    if (existing) {
      this.updateInfo(existing.id, { name, macAddress, ipAddress });
      return existing.id;
    } else {
      return this.create({ name, macAddress, ipAddress });
    }
  },
};
