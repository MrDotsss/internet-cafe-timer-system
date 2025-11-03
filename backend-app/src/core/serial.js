import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { SessionService } from "../services/sessionService.js";
import { ClientService } from "../services/clientService.js";
import config from "config";
import { getConfig } from "../services/configService.js";

let port;
let parser;
let ready = false;

/**
 * Initialize Serial connection with Arduino
 */
export function setupSerial() {
  const portName = config.get("arduino.port") || "COM7";
  const baudRate = config.get("arduino.baudRate") || 9600;

  port = new SerialPort({ path: portName, baudRate });
  parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

  port.on("open", () => {
    console.log(`🔌 Serial connected on ${portName}`);
    ready = true;
  });

  port.on("close", () => {
    console.log(`🔌 Serial closed`);
    ready = false;
  });

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
async function handleIncoming(msg) {
  switch (msg.type) {
    case "session": {
      const pcId = msg.pc;
      const minutes = msg.time;

      console.log(`🕹️ Session event from Arduino → PC:${pcId} ${minutes}min`);

      const client = ClientService.getById(pcId);

      if (!client) {
        console.log(`❌ PC ${pcId} not found in DB`);
        sendToArduino({
          type: "session_res",
          pc: pcId,
          ack: false,
          error: "PC not available",
        });
        return;
      }

      // Start session only if no active session exists
      const activeSessions = SessionService.getAllActiveSessions();
      const currentSession = activeSessions.find((s) => s.pcId === pcId);

      let sessionId;
      if (!currentSession) {
        sessionId = SessionService.startSession(pcId);
      } else {
        sessionId = currentSession.id;
      }

      if (minutes > 0) {
        // Extend session
        const amount = (minutes / getConfig("arduino.minutesPerCoin")) * 1; // calculate amount if needed
        SessionService.extendSession(pcId, minutes, "arduino", amount);
      }

      // Send acknowledgment back to Arduino
      sendToArduino({
        type: "session_res",
        pc: pcId,
        ack: true,
        timeAdded: minutes,
      });

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

export function isSerialReady() {
  return ready && port !== null;
}

/**
 * Send initial config on startup with retries
 */
export function sendInitialConfig(retries = 5, delayMs = 3500) {
  const payload = {
    type: "config",
    minutesPerCoin: getConfig("arduino.minutesPerCoin"),
  };

  let attempt = 0;

  const trySend = () => {
    if (isSerialReady()) {
      sendToArduino(payload);
      console.log("📡 Initial Arduino config sent:", payload);
    } else {
      attempt++;
      if (attempt <= retries) {
        console.log(
          `⏳ Serial not ready, retrying initial config (${attempt}/${retries})...`
        );
        setTimeout(trySend, delayMs);
      } else {
        console.error(
          "❌ Failed to send initial config: Serial not ready after retries"
        );
      }
    }
  };

  trySend();
}
