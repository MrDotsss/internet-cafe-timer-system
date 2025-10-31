import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue"; // remove if not using Vue
import path from "node:path";

export default defineConfig({
  root: path.join(__dirname, "src/renderer"),
  plugins: [vue()],
  build: {
    outDir: path.join(__dirname, "out/renderer/main_window"),
    emptyOutDir: true,
  },
});
