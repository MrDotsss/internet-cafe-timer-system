import { getDatabase } from "../db/database.js";
import { TransactionService } from "./transactionService.js";
import { ClientService } from "./clientService.js";
import { SocketEmit } from "../sockets/socketManager.js";

const db = getDatabase();

export const SessionService = {
  startSession(pcId) {
    // End any active sessions
    db.prepare(
      "UPDATE Sessions SET active = 0 WHERE pcId = ? AND active = 1"
    ).run(pcId);

    const now = new Date().toISOString();
    const result = db
      .prepare(
        `INSERT INTO Sessions (pcId, startUtc, expiryUtc, active)
         VALUES (?, ?, ?, 1)`
      )
      .run(pcId, now, now); // expiry initially = start time (no time yet)

    const sessionId = result.lastInsertRowid;

    ClientService.updateStatus(pcId, "active");
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

    ClientService.updateStatus(pcId, "idle");
    SocketEmit.sessionEnd(pcId);

    console.log(`🕒 Session ended for PC ${pcId}, duration ${duration}m`);
    return session.id;
  },

  extendSession(pcId, minutes, source = "admin", amount = 0) {
    const session = db
      .prepare("SELECT * FROM Sessions WHERE pcId = ? AND active = 1")
      .get(pcId);

    if (!session) {
      console.warn(`⚠️ No active session found for PC ${pcId}, starting new.`);
      this.startSession(pcId);
      return this.extendSession(pcId, minutes, source, amount);
    }

    const expiry = session.expiryUtc
      ? new Date(session.expiryUtc)
      : new Date(session.startUtc);
    expiry.setMinutes(expiry.getMinutes() + minutes);

    db.prepare("UPDATE Sessions SET expiryUtc = ? WHERE id = ?").run(
      expiry.toISOString(),
      session.id
    );

    TransactionService.log(pcId, session.id, source, amount, minutes);

    SocketEmit.sessionExtend(pcId, minutes);
    console.log(`💰 Extended PC ${pcId} by ${minutes} minutes`);
  },

  getActiveSessions() {
    return db.prepare("SELECT * FROM Sessions WHERE active = 1").all();
  },
};
