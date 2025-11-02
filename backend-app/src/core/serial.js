import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { SessionService } from "../services/sessionService.js";
import { SocketEmit } from "../sockets/socketManager.js";
import config from "config";

let port;
let parser;

/**
 * Initialize Serial connection with Arduino
 */
export function setupSerial() {
  const portName = config.get("arduino.port") || "COM3"; // adjust to your board
  const baudRate = config.get("arduino.baudRate") || 9600;

  port = new SerialPort({ path: portName, baudRate });
  parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

  port.on("open", () => console.log(`🔌 Serial connected on ${portName}`));

  parser.on("data", (raw) => {
    try {
      const data = JSON.parse(raw.trim());
      handleIncoming(data);
    } catch (err) {
      console.warn("⚠️ Invalid JSON from Arduino:", raw);
    }
  });

  port.on("error", (err) => console.error("Serial error:", err.message));
}

/**
 * Handle incoming serial messages from Arduino
 */
function handleIncoming(msg) {
  switch (msg.type) {
    case "session": {
      const pcId = msg.pc;
      const time = msg.time;

      console.log(`🕹️ Session event from Arduino → PC:${pcId} ${time}min`);

      SessionService.startSession(pcId);
      if (time > 0) {
        SessionService.extendSession(pcId, time, "arduino");
      }
      break;
    }

    case "config_res": {
      console.log("⚙️ Config acknowledged:", msg);
      break;
    }

    default:
      console.log("Unknown serial message:", msg);
  }
}

/**
 * Send JSON command to Arduino
 */
export function sendToArduino(payload) {
  if (!port?.writable) return console.warn("⚠️ Serial not ready");
  const json = JSON.stringify(payload);
  port.write(json + "\n", (err) => {
    if (err) console.error("Serial write failed:", err.message);
  });
}

/**
 * Example: Send config on startup
 */
export function sendInitialConfig() {
  const configData = {
    type: "config",
    minutesPerCoin: config.get("arduino.minutesPerCoin") || 6,
    maxPCs: config.get("arduino.maxPCs") || 10,
  };
  sendToArduino(configData);
}
