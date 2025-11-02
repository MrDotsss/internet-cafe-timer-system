// src/core/syncLoop.js
import { ClientService } from "../services/clientService.js";

export function startSyncLoop(io) {
  console.log("🔁 Sync loop started");

  setInterval(() => {
    const clients = ClientService.getAll();
    const now = new Date();

    clients.forEach((client) => {
      if (client.expiryUtc) {
        const expiry = new Date(client.expiryUtc);
        if (expiry <= now && client.status !== "expired") {
          ClientService.updateStatus(client.id, "expired");
          io.emit("client:expired", { id: client.id });
          console.log(`⏰ PC ${client.label || client.id} expired`);
        }
      }
    });

    io.emit("clients:update", clients);
  }, 1000 * 30); // every 30s
}
