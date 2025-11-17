<template>
  <v-card
    class="text-center"
    min-width="200"
    color="error"
    variant="outlined"
    style="aspect-ratio: 1"
  >
    <v-card-title>PC-01</v-card-title>
    <v-card-subtitle>
      <v-icon size="x-large" color="error">mdi-monitor-off</v-icon>
    </v-card-subtitle>
    <v-card-text> <v-chip color="red">OFFLINE</v-chip></v-card-text>
    <v-card-actions>
      <v-btn
        color="primary"
        text="Controls"
        variant="text"
        @click="reveal = true"
      ></v-btn>
    </v-card-actions>

    <v-expand-transition>
      <v-card
        v-if="reveal"
        class="position-absolute w-100"
        height="100%"
        style="bottom: 0"
      >
        <v-card-text class="d-flex flex-wrap ga-2">
          <v-btn
            v-for="actions in sessionActions"
            @click="
              () => {
                reveal = false;
                actions.action();
              }
            "
            v-tooltip:bottom="actions.tooltip"
            :icon="actions.icon"
            :color="actions.color"
          ></v-btn>
          <v-divider></v-divider>
          <v-btn
            v-for="actions in powerActions"
            @click="
              () => {
                reveal = false;
                actions.action();
              }
            "
            v-tooltip:bottom="actions.tooltip"
            :icon="actions.icon"
            :color="actions.color"
          ></v-btn>
        </v-card-text>
        <v-card-actions class="pt-0">
          <v-btn
            color="teal-accent-4"
            text="Close"
            variant="text"
            @click="reveal = false"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
  </v-card>
</template>
<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  pcInfo: {
    type: Object,
    required: true,
  },
});

const reveal = ref(false);
let timeoutId;

watch(reveal, (val) => {
  if (val) {
    timeoutId = setTimeout(() => (reveal.value = false), 3000);
  } else {
    clearTimeout(timeoutId);
  }
});

const sessionActions = [
  {
    tooltip: "Start Admin",
    icon: "mdi-account-cowboy-hat",
    color: "grey",
    action: function () {
      console.log(`${pcInfo.name} says ${this.tooltip}`);
    },
  },
  {
    tooltip: "Start Session",
    icon: "mdi-timer-check",
    color: "success",
    action: function () {
      console.log(`${pcInfo.name} says ${this.tooltip}`);
    },
  },
  {
    tooltip: "Stop Session",
    icon: "mdi-timer-stop",
    color: "error",
    action: function () {
      console.log(`${pcInfo.name} says ${this.tooltip}`);
    },
  },
];

const powerActions = [
  {
    tooltip: "Power On",
    icon: "mdi-power-settings",
    color: "success",
    action: function () {
      console.log(`${pcInfo.name} says ${this.tooltip}`);
    },
  },
  {
    tooltip: "Reboot",
    icon: "mdi-restart",
    color: "warning",
    action: function () {
      console.log(`${pcInfo.name} says ${this.tooltip}`);
    },
  },
  {
    tooltip: "Power Off",
    icon: "mdi-power",
    color: "error",
    action: function () {
      console.log(`${pcInfo.name} says ${this.tooltip}`);
    },
  },
];
</script>
