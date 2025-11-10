import { ClientService } from "../services/clientService.js";
import { SessionService } from "../services/sessionService.js";
import { SocketEmit } from "../sockets/socketManager.js";

export function startSyncLoop(io) {
  console.log("🔁 Sync loop started");

  setInterval(() => {
    const activeSessions = SessionService.getAllActiveSessions();
    const now = new Date();

    activeSessions.forEach((session) => {
      if (!session.expiryUtc) return;

      const expiry = new Date(session.expiryUtc);

      if (expiry <= now) {
        // End session if expired
        SessionService.endSession(session.pcId);

        // ClientService.updateStatus is already called inside endSession
        SocketEmit.clientExpired(session.pcId);

        console.log(`⏰ Session for PC ${session.pcId} expired automatically`);
      }
    });

    // Broadcast all clients
    const allClients = ClientService.getAll();
    SocketEmit.clientUpdate(allClients);
  }, 1000 * 30); // every 30s
}
