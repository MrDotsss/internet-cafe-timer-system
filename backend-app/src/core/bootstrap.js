// src/core/bootstrap.js
import config from "config";
import { createServer } from "./server.js";
import { setupGracefulShutdown } from "./shutdown.js";
import { initDatabase } from "../db/index.js";

export async function bootstrap() {
  console.log("Starting backend...");

  const { app, httpServer, io } = createServer(config);

  // Placeholder: initialize DB, serial, sockets here later
  console.log("Initializing modules...");

  const port = config.get("server.port");
  initDatabase();
  httpServer.listen(port, () => {
    console.log(`✅ Backend running on port ${port}`);
  });

  setupGracefulShutdown(httpServer);

  return { app, io, httpServer };
}
