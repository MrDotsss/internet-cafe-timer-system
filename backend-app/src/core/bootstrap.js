// src/core/bootstrap.js
import config from "config";
import { createServer } from "./server.js";
import { setupGracefulShutdown } from "./shutdown.js";

export async function bootstrap() {
  console.log("Starting backend...");

  const { app, httpServer, io } = createServer(config);

  // Placeholder: initialize DB, serial, sockets here later
  console.log("Initializing modules...");

  const port = config.get("server.port");
  httpServer.listen(port, () => {
    console.log(`✅ Backend running on port ${port}`);
  });

  setupGracefulShutdown(httpServer);

  return { app, io, httpServer };
}
