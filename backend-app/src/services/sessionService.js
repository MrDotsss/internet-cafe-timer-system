// src/services/sessionService.js
import { getDatabase } from "../db/database.js";
import { TransactionService } from "./transactionService.js";
import { ClientService } from "./clientService.js";
import { SocketEmit } from "../sockets/socketManager.js";

const db = getDatabase();

export const SessionService = {
  startSession(pcId) {
    // End any active sessions first
    db.prepare(
      "UPDATE Sessions SET active = 0 WHERE pcId = ? AND active = 1"
    ).run(pcId);

    // Create a new session
    const result = db
      .prepare(
        `INSERT INTO Sessions (pcId, startUtc, active) VALUES (?, DATETIME('now'), 1)`
      )
      .run(pcId);

    const sessionId = result.lastInsertRowid;
    SocketEmit.sessionStart(pcId);
    console.log(`🕒 Session started for PC ${pcId} (#${sessionId})`);
    return sessionId;
  },

  endSession(pcId) {
    const session = db
      .prepare("SELECT * FROM Sessions WHERE pcId = ? AND active = 1")
      .get(pcId);
    if (!session) return;

    const endTime = new Date().toISOString();
    const duration = Math.floor(
      (new Date(endTime) - new Date(session.startUtc)) / 60000
    );

    db.prepare(
      `UPDATE Sessions
       SET endUtc = ?, durationMinutes = ?, active = 0
       WHERE id = ?`
    ).run(endTime, duration, session.id);

    SocketEmit.sessionEnd(pcId);
    console.log(`🕒 Session ended for PC ${pcId}, duration ${duration}m`);
    return session.id;
  },

  extendSession(pcId, minutes, source = "admin", amount = 0) {
    const client = ClientService.getById(pcId);
    const expiry = client.expiryUtc ? new Date(client.expiryUtc) : new Date();
    expiry.setMinutes(expiry.getMinutes() + minutes);

    ClientService.updateExpiry(pcId, expiry.toISOString());
    TransactionService.log(pcId, null, source, amount, minutes);

    SocketEmit.sessionExtend(pcId, minutes);
    console.log(`💰 Extended PC ${pcId} by ${minutes} minutes`);
  },

  getActiveSessions() {
    return db.prepare("SELECT * FROM Sessions WHERE active = 1").all();
  },
};
