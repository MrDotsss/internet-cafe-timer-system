<!-- File: src/renderer/pages/Dashboard.vue -->
<template>
  <div class="p-4">
    <h1>Admin Dashboard</h1>

    <div class="mt-4">
      <button @click="fetchStatus">🔄 Refresh Server Status</button>
      <p v-if="loading">Loading...</p>

      <div v-if="status">
        <p><strong>Server Port:</strong> {{ status.port }}</p>
        <p><strong>Clients:</strong> {{ status.clients.length }}</p>
        <p><strong>Sessions:</strong> {{ status.sessions.length }}</p>

        <div v-if="status.clients.length">
          <h3>Clients</h3>
          <ul>
            <li v-for="client in status.clients" :key="client.id">
              PC {{ client.pc }} — {{ client.status }}
            </li>
          </ul>
        </div>

        <div v-if="status.sessions.length">
          <h3>Sessions</h3>
          <ul>
            <li v-for="s in status.sessions" :key="s.id">
              {{ s.pc }} | {{ new Date(s.startAt).toLocaleTimeString() }} →
              {{ new Date(s.endAt).toLocaleTimeString() }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="mt-6">
      <h3>Quick Test Controls</h3>
      <input v-model.number="testPc" placeholder="PC #" type="number" />
      <input v-model.number="testMinutes" placeholder="Minutes" type="number" />
      <button @click="addTime">➕ Add Time</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const status = ref(null);
const loading = ref(false);
const testPc = ref(1);
const testMinutes = ref(5);

async function fetchStatus() {
  loading.value = true;
  try {
    status.value = await window.adminApi.getStatus();
  } catch (err) {
    console.error("Failed to fetch status", err);
  } finally {
    loading.value = false;
  }
}

async function addTime() {
  const res = await window.adminApi.addTime(testPc.value, testMinutes.value);
  console.log("AddTime Result:", res);
  fetchStatus();
}

onMounted(() => {
  window.adminApi.onEvent("backend:server_started", (data) => {
    console.log("Server started:", data);
  });
  window.adminApi.onEvent("backend:client_update", (data) => {
    console.log("Client update:", data);
    fetchStatus();
  });
  window.adminApi.onEvent("backend:session_update", (data) => {
    console.log("Session update:", data);
    fetchStatus();
  });

  fetchStatus();
});
</script>

<style scoped>
button {
  margin: 0.25rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
</style>
