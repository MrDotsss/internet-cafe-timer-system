import config from "config";
import { createServer } from "./server.js";
import { initDatabase } from "../db/index.js";
import { setupGracefulShutdown } from "./shutdown.js";
import { startSyncLoop } from "./syncLoop.js";
import apiRouter from "../api/index.js";

export async function bootstrap() {
  console.log("Starting backend...");

  // 🧱 Initialize database
  const db = initDatabase();

  const { app, httpServer, io } = createServer(config);

  console.log("Initializing modules...");

  app.use("/api", apiRouter);

  startSyncLoop(io);

  const port = config.get("server.port");
  httpServer.listen(port, () => {
    console.log(`✅ Backend running on port ${port}`);
  });

  setupGracefulShutdown(httpServer);
  return { app, io, httpServer, db };
}
