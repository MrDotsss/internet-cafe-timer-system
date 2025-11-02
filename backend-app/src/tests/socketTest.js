import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected to backend");
  socket.emit("admin:join");
});

socket.on("session:start", (data) => console.log("Session started", data));
socket.on("session:extend", (data) => console.log("Session extended", data));
socket.on("client:expired", (data) => console.log("Client expired", data));
