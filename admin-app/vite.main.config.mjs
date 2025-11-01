import { defineConfig } from "vite";
import { builtinModules } from "node:module";
import path from "node:path";

export default defineConfig({
  build: {
    target: "node18",
    outDir: ".vite/build", // 👈 output where Forge can find it
    rollupOptions: {
      external: [...builtinModules, "ws", "bufferutil", "utf-8-validate"],
      input: "src/main.js",
    },
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
