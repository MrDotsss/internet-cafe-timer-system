import { defineStore } from "pinia";
import { ref, computed, inject, onMounted } from "vue";

export const useSessionStore = defineStore("session", () => {
  const sessions = ref([]);
  const socket = inject("socket");

  // Load initial session data
  const fetchSessions = () => {
    socket.emit("getSessions");
  };

  // Socket listeners
  const setupSocketListeners = () => {
    socket.on("sessions", (data) => {
      sessions.value = data;
      console.table("✅ Session data updated:", data);
    });

    socket.on("sessionUpdated", (session) => {
      const index = sessions.value.findIndex((s) => s.id === session.id);
      if (index !== -1) {
        sessions.value[index] = session;
      } else {
        sessions.value.push(session);
      }
    });

    socket.on("sessionExpired", (sessionId) => {
      const s = sessions.value.find((s) => s.id === sessionId);
      if (s) s.status = "expired";
    });
  };

  // Actions
  const addTime = (pcId, minutes) => {
    socket.emit("addTime", { pcId, minutes });
  };

  const lockClient = (pcId) => {
    socket.emit("lockClient", pcId);
  };

  const unlockClient = (pcId) => {
    socket.emit("unlockClient", pcId);
  };

  onMounted(() => {
    setupSocketListeners();
    fetchSessions();
  });

  const activeSessions = computed(() =>
    sessions.value.filter((s) => s.status === "active")
  );

  return {
    sessions,
    activeSessions,
    addTime,
    lockClient,
    unlockClient,
  };
});
