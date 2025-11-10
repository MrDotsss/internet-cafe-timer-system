<template>
  <v-app-bar>
    <v-app-bar-title>Session Monitor</v-app-bar-title>
    <div class="d-flex ga-1 pr-5 align-center">
      <p>Controls</p>
      <v-divider vertical class="border-opacity-25 ml-2"></v-divider>
      <v-btn
        v-for="(item, i) in sessionActions"
        :key="i"
        :color="item.color"
        :icon="item.icon"
        v-tooltip:bottom="item.tooltip"
      ></v-btn>
      <v-divider vertical class="border-opacity-25 ml-2"></v-divider>
      <v-btn
        v-for="(item, i) in powerActions"
        :key="i"
        :color="item.color"
        :icon="item.icon"
        v-tooltip:bottom="item.tooltip"
      ></v-btn>
    </div>
  </v-app-bar>
  <v-container class="fill-height d-flex align-start justify-center ga-8">
    <Computer v-for="n in clientStore.pcList" :pc-data="n" />
  </v-container>
</template>

<script setup>
import { useClientStore } from "@/stores/clientStore";

const clientStore = useClientStore();
clientStore.getPCList();

const sessionActions = [
  {
    color: "grey",
    icon: "mdi-account-cowboy-hat",
    tooltip: "Admin All Session",
  },
  { color: "success", icon: "mdi-timer-play", tooltip: "Start All Session" },
  { color: "warning", icon: "mdi-timer-pause", tooltip: "Pause All Session" },
  { color: "red", icon: "mdi-timer-remove", tooltip: "Stop All Session" },
];
const powerActions = [
  { color: "red", icon: "mdi-power", tooltip: "Power Off All Clients" },
  { color: "warning", icon: "mdi-restart", tooltip: "Restart All Clients" },
  { color: "info", icon: "mdi-power-sleep", tooltip: "Turn off Idle Clients" },
];
</script>
