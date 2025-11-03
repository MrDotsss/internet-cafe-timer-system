import { getDatabase } from "../db/database.js";
import { TransactionService } from "./transactionService.js";
import { ClientService } from "./clientService.js";
import { SocketEmit } from "../sockets/socketManager.js";

const db = getDatabase();

export const SessionService = {
  /**
   * Starts a new session only if none is currently active for the PC.
   */
  startSession(pcId) {
    const activeSession = db
      .prepare("SELECT * FROM Sessions WHERE pcId = ? AND active = 1")
      .get(pcId);

    if (activeSession) {
      console.log(`⚠️ Session already active for PC ${pcId}`);
      return activeSession.id;
    }

    const now = new Date().toISOString();

    const result = db
      .prepare(
        `INSERT INTO Sessions (pcId, startUtc, expiryUtc, active)
         VALUES (?, ?, ?, 1)`
      )
      .run(pcId, now, now);

    const sessionId = result.lastInsertRowid;

    ClientService.updateStatus(pcId, "active");
    SocketEmit.sessionStart(pcId);

    console.log(`🕒 Session started for PC ${pcId} (#${sessionId})`);
    return sessionId;
  },

  /**
   * Ends the current active session for a PC.
   */
  endSession(pcId) {
    const session = db
      .prepare("SELECT * FROM Sessions WHERE pcId = ? AND active = 1")
      .get(pcId);

    if (!session) {
      console.warn(`⚠️ No active session found for PC ${pcId}`);
      return null;
    }

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

  /**
   * Extends an active session or starts a new one if none exists.
   * Always creates a new transaction record.
   */
  extendSession(pcId, minutes, source = "admin", amount = 0) {
    // Ensure there's an active session
    let session = db
      .prepare("SELECT * FROM Sessions WHERE pcId = ? AND active = 1")
      .get(pcId);

    if (!session) {
      console.log(`⚙️ No active session for PC ${pcId}, starting new one.`);
      const sessionId = this.startSession(pcId);
      session = db
        .prepare("SELECT * FROM Sessions WHERE id = ?")
        .get(sessionId);
    }

    const newExpiry = session.expiryUtc
      ? new Date(session.expiryUtc)
      : new Date(session.startUtc);
    newExpiry.setMinutes(newExpiry.getMinutes() + minutes);

    db.prepare("UPDATE Sessions SET expiryUtc = ? WHERE id = ?").run(
      newExpiry.toISOString(),
      session.id
    );

    TransactionService.log(pcId, session.id, source, amount, minutes);
    SocketEmit.sessionExtend(pcId, minutes);

    console.log(
      `💰 Extended session for PC ${pcId} by ${minutes} minutes (new expiry: ${newExpiry.toISOString()})`
    );

    return session.id;
  },

  /**
   * Retrieves all currently active sessions.
   */
  getAllActiveSessions() {
    return db.prepare("SELECT * FROM Sessions WHERE active = 1").all();
  },

  getActiveSession(pcId) {
    return db
      .prepare("SELECT * FROM Sessions WHERE pcId = ? AND active = 1")
      .get(pcId);
  },
};
