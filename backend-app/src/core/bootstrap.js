import config from "config";
import { createServer } from "./server.js";
import { initDatabase } from "../db/index.js";
import { setupGracefulShutdown } from "./shutdown.js";
import { startSyncLoop } from "./syncLoop.js";
import apiRouter from "../api/index.js";
import { setupSocket } from "../sockets/socketManager.js";
import { setupSerial, sendInitialConfig } from "./serial.js";
import { loadConfig } from "../services/configService.js";

export async function bootstrap() {
  console.log("Starting backend...");

  // 🧱 Initialize database
  const db = initDatabase();

  loadConfig();

  const { app, httpServer, io } = createServer(config);

  console.log("Initializing modules...");

  setupSocket(io);
  setupSerial();
  sendInitialConfig();
  startSyncLoop(io);

  app.use("/api", apiRouter);

  const port = config.get("server.port");
  httpServer.listen(port, () => {
    console.log(`✅ Backend running on port ${port}`);
  });

  setupGracefulShutdown(httpServer);
  return { app, io, httpServer, db };
}
