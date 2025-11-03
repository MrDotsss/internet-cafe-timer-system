import fs from "fs";
import path from "path";
import { getDatabase } from "../db/database.js";
import { sendToArduino } from "../core/serial.js";
import { ClientService } from "./clientService.js";

const db = getDatabase();
const defaultConfigPath = path.resolve("config/default.json");

let runtimeConfig = {};

/**
 * Load defaults from JSON and merge with env variables
 */
export function loadConfig() {
  const defaultConfig = JSON.parse(fs.readFileSync(defaultConfigPath));

  runtimeConfig = {
    server: {
      port: process.env.SERVER_PORT || defaultConfig.server.port,
    },
    database: {
      path: defaultConfig.database.path,
    },
    arduino: {
      port: process.env.ARDUINO_PORT || defaultConfig.arduino.port,
      baudRate: process.env.ARDUINO_BAUDRATE || defaultConfig.arduino.baudRate,
      minutesPerCoin:
        parseInt(process.env.ARDUINO_MINUTES_PER_COIN) ||
        defaultConfig.arduino.minutesPerCoin,
    },
  };

  // Load from DB if exists
  const rows = db.prepare("SELECT key, value FROM Config").all();
  rows.forEach(({ key, value }) => {
    const keys = key.split(".");
    let target = runtimeConfig;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!target[keys[i]]) target[keys[i]] = {};
      target = target[keys[i]];
    }
    target[keys[keys.length - 1]] = JSON.parse(value);
  });

  console.log("⚙️ Config loaded:", runtimeConfig);
  return runtimeConfig;
}

/**
 * Get config at runtime
 */
export function getConfig(keyPath) {
  if (!keyPath) return runtimeConfig;

  const keys = keyPath.split(".");
  let target = runtimeConfig;
  for (const key of keys) {
    if (target[key] === undefined) return undefined;
    target = target[key];
  }
  return target;
}

/**
 * Update config both runtime and DB
 */
export function setConfig(keyPath, value) {
  // Update runtime
  const keys = keyPath.split(".");
  let target = runtimeConfig;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!target[keys[i]]) target[keys[i]] = {};
    target = target[keys[i]];
  }
  target[keys[keys.length - 1]] = value;

  // Update DB
  const valueStr = JSON.stringify(value);
  const exists = db
    .prepare("SELECT key FROM Config WHERE key = ?")
    .get(keyPath);
  if (exists) {
    db.prepare(
      "UPDATE Config SET value = ?, updatedAt = CURRENT_TIMESTAMP WHERE key = ?"
    ).run(valueStr, keyPath);
  } else {
    db.prepare("INSERT INTO Config (key, value) VALUES (?, ?)").run(
      keyPath,
      valueStr
    );
  }

  if (keyPath === "arduino.minutesPerCoin") {
    const payload = {
      type: "config",
      minutesPerCoin: value,
    };
    sendToArduino(payload);
    console.log("📡 Sent updated config to Arduino:", payload);
  }

  console.log(`⚙️ Config updated: ${keyPath} = ${value}`);
  return value;
}
