// src/core/shutdown.js
export function setupGracefulShutdown(httpServer) {
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down backend...");
    httpServer.close(() => {
      console.log("✅ Server closed.");
      process.exit(0);
    });
  });
}
