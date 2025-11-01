<template>
  <div class="dashboard">
    <header class="header">
      <h1>🖥️ Internet Café Dashboard</h1>
      <p>
        Status:
        <strong>{{ isConnected ? "🟢 Connected" : "🔴 Disconnected" }}</strong>
      </p>
    </header>

    <section v-if="sessions.length" class="sessions">
      <div
        v-for="s in sessions"
        :key="s.id"
        class="session-card"
        :class="{
          expired: s.status === 'expired',
          locked: s.status === 'locked',
        }"
      >
        <h3>PC {{ s.pcNumber }}</h3>
        <p><strong>Status:</strong> {{ s.status }}</p>
        <p><strong>Time Left:</strong> {{ s.timeLeft }} min</p>

        <div class="actions">
          <button @click="addTime(s.pcNumber, 30)">+30 min</button>
          <button @click="lockClient(s.pcNumber)">Lock</button>
          <button @click="unlockClient(s.pcNumber)">Unlock</button>
        </div>
      </div>
    </section>

    <section v-else class="empty">
      <p>No active sessions yet...</p>
    </section>
  </div>
</template>

<script setup>
import { inject, onMounted } from "vue";
import { useSessionStore } from "../stores/sessionStore.js";

const isConnected = inject("isConnected");
const store = useSessionStore();
const { sessions, addTime, lockClient, unlockClient } = store;

onMounted(() => {
  // ensure latest data when page opens
  const socket = inject("socket");
  socket.emit("getSessions");
});
</script>

<style scoped>
.dashboard {
  padding: 1.5rem;
  color: #f0f0f0;
  background-color: #1a1a1a;
  min-height: 100vh;
}

.header {
  margin-bottom: 1.5rem;
}

.sessions {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.session-card {
  background: #242424;
  border-radius: 12px;
  padding: 1rem;
  transition: background 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.session-card.expired {
  background: #3a1d1d;
}

.session-card.locked {
  background: #2a2a3a;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

button {
  background: #444;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #666;
}

.empty {
  text-align: center;
  opacity: 0.7;
  font-style: italic;
  margin-top: 2rem;
}
</style>
