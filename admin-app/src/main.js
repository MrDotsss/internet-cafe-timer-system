// File: src/main.js
// Modified to start backend and forward backend events to renderer windows.

import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import { createBackend } from "./backend/expressApp.js";

// Early exit for Squirrel installer
if (started) {
  app.quit();
}

let mainWindow;
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
};

app.whenReady().then(async () => {
  // Start backend server first
  const backend = createBackend();

  // forward backend events to renderer windows
  backend.on("started", (data) => {
    BrowserWindow.getAllWindows().forEach((w) => {
      w.webContents.send("backend:server_started", data);
    });
  });
  backend.on("client_connected", (data) => {
    BrowserWindow.getAllWindows().forEach((w) => {
      w.webContents.send("backend:client_update", { type: "connected", data });
    });
  });
  backend.on("client_disconnected", (data) => {
    BrowserWindow.getAllWindows().forEach((w) => {
      w.webContents.send("backend:client_update", {
        type: "disconnected",
        data,
      });
    });
  });
  backend.on("session_update", (data) => {
    BrowserWindow.getAllWindows().forEach((w) => {
      w.webContents.send("backend:session_update", data);
    });
  });

  await backend.start(); // default port 3030

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // IPC handlers from renderer to backend
  ipcMain.handle("admin:addTime", async (_, { pc, minutes }) => {
    try {
      const s = backend.addTimeToPc(pc, minutes);
      return { ok: true, session: s };
    } catch (err) {
      return { ok: false, err: String(err) };
    }
  });

  ipcMain.handle("admin:controlPc", async (_, { pc, action }) => {
    try {
      const ok = backend.controlPc(pc, action);
      return { ok };
    } catch (err) {
      return { ok: false, err: String(err) };
    }
  });

  ipcMain.handle("admin:getStatus", async () => {
    // lightweight snapshot
    return {
      clients: Array.from(backend.clients.values()),
      sessions: Array.from(backend.sessions.values()),
      port: backend.port,
    };
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
