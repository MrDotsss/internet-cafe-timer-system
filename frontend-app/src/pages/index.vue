<template>
  <v-app-bar>
    <v-app-bar-title>Session Monitor</v-app-bar-title>
    <template v-slot:append>
      <v-container class="d-flex">
        <v-btn
          v-for="actions in globalActions"
          @click="actions.action()"
          v-tooltip:bottom="actions.tooltip"
          :icon="actions.icon"
          :color="actions.color"
        ></v-btn>
        <v-divider
          vertical
          thickness="4"
          color="bg-surface-variant"
        ></v-divider>
        <v-btn
          v-for="actions in powerActions"
          @click="actions.action()"
          v-tooltip:bottom="actions.tooltip"
          :icon="actions.icon"
          :color="actions.color"
        ></v-btn>
      </v-container>
    </template>
  </v-app-bar>

  <v-container class="d-flex flex-wrap ga-8">
    <Computer v-for="value in 10" />
  </v-container>
</template>

<script setup>
const globalActions = [
  {
    tooltip: "Start Admin",
    icon: "mdi-account-cowboy-hat",
    color: "grey",
    action: function () {
      console.log(this.tooltip);
    },
  },
  {
    tooltip: "Start Session",
    icon: "mdi-timer-check",
    color: "success",
    action: function () {
      console.log(this.tooltip);
    },
  },
  {
    tooltip: "Pause Session",
    icon: "mdi-timer-pause",
    color: "warning",
    action: function () {
      console.log(this.tooltip);
    },
  },
  {
    tooltip: "Stop Session",
    icon: "mdi-timer-stop",
    color: "error",
    action: function () {
      console.log(this.tooltip);
    },
  },
];

const powerActions = [
  {
    tooltip: "Power On",
    icon: "mdi-power-settings",
    color: "success",
    action: function () {
      console.log(this.tooltip);
    },
  },
  {
    tooltip: "Reboot",
    icon: "mdi-restart",
    color: "warning",
    action: function () {
      console.log(this.tooltip);
    },
  },
  {
    tooltip: "Turn Off Idle",
    icon: "mdi-power-sleep",
    color: "info",
    action: function () {
      console.log(this.tooltip);
    },
  },
];
</script>
