import EventEmitter from "events";

class SessionManager extends EventEmitter {
  constructor() {
    super();
    this.sessions = new Map(); // { pcId: { endTime, status, remaining } }
    this.interval = null;
  }

  start() {
    // Runs every second
    if (!this.interval) {
      this.interval = setInterval(() => this.updateSessions(), 1000);
    }
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  }

  createOrUpdateSession(pcId, minutes) {
    const now = Date.now();
    const session = this.sessions.get(pcId);
    const endTime = session
      ? session.endTime + minutes * 60 * 1000
      : now + minutes * 60 * 1000;

    const newSession = {
      pcId,
      endTime,
      status: "active",
    };

    this.sessions.set(pcId, newSession);
    this.emit("sessionUpdated", newSession);
  }

  lockSession(pcId) {
    const s = this.sessions.get(pcId);
    if (s) {
      s.status = "locked";
      this.emit("sessionUpdated", s);
    }
  }

  unlockSession(pcId) {
    const s = this.sessions.get(pcId);
    if (s) {
      s.status = "active";
      this.emit("sessionUpdated", s);
    }
  }

  updateSessions() {
    const now = Date.now();

    for (const [pcId, s] of this.sessions.entries()) {
      if (s.status === "active") {
        const remaining = Math.max(0, Math.floor((s.endTime - now) / 1000));

        if (remaining <= 0) {
          s.status = "expired";
          this.emit("sessionExpired", pcId);
          this.emit("sessionUpdated", s);
        }
      }
    }
  }

  getAllSessions() {
    return Array.from(this.sessions.values()).map((s) => {
      const remaining = Math.max(
        0,
        Math.floor((s.endTime - Date.now()) / 1000)
      );
      return { ...s, remaining };
    });
  }
}

export const sessionManager = new SessionManager();
