<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup>
import { socket } from "@/socket";
import { useClientStore } from "./stores/clientStore";

const clientStore = useClientStore();

socket.off();

socket.on("connect", () => {
  socket.emit("admin:join");
});

clientStore.bindEvents();
</script>
