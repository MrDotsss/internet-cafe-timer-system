import { io } from "socket.io-client";
import { ref } from "vue";

export function useSocket() {
  const socket = io("http://localhost:3030"); // Adjust if you use a different backend port
  const isConnected = ref(false);

  socket.on("connect", () => {
    console.log("✅ Connected to backend");
    isConnected.value = true;
    socket.emit("getSessions");
  });

  socket.on("disconnect", () => {
    console.log("⚠️ Disconnected from backend");
    isConnected.value = false;
  });

  return { socket, isConnected };
}
