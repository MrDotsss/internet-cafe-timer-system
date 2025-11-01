// File: src/preload.js
// Expose a small API to the renderer to communicate with main process.
// Use secure channels only.

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("adminApi", {
  // invoke admin actions (these are handled by main -> backend)
  addTime: (pc, minutes) =>
    ipcRenderer.invoke("admin:addTime", { pc, minutes }),
  controlPc: (pc, action) =>
    ipcRenderer.invoke("admin:controlPc", { pc, action }),
  // get server status (http fetch to localhost from renderer is also fine)
  getStatus: () => ipcRenderer.invoke("admin:getStatus"),
  // listen to events from main/backend
  onEvent: (channel, cb) => {
    const valid = [
      "backend:client_update",
      "backend:session_update",
      "backend:server_started",
    ];
    if (!valid.includes(channel)) throw new Error("Invalid channel");
    ipcRenderer.on(channel, (_, data) => cb(data));
  },
});
