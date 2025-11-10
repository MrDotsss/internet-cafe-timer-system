<template>
  <v-card
    class="d-flex flex-wrap aspr-square border-md align-center justify-center"
    min-width="192px"
    variant="flat"
    :color="statusColors[pcData.status]"
  >
    <v-card-item>
      <v-card-title>{{ pcData.name }}</v-card-title>
      <v-card-subtitle
        ><v-chip variant="outlined">{{
          pcData.status.toUpperCase()
        }}</v-chip></v-card-subtitle
      >
    </v-card-item>
    <v-card-actions class="d-flex justify-center flex-1-1-100 bg-surface-light">
      <v-btn @click="reveal = true">Control</v-btn>
    </v-card-actions>

    <v-expand-transition>
      <v-card
        v-if="reveal"
        class="position-absolute w-100 border-md"
        height="100%"
        style="bottom: 0"
      >
        <v-card-actions>
          <v-btn @click="reveal = false">Close</v-btn>
        </v-card-actions>
        <div class="d-flex align-center justify-center ga-2">
          <v-btn
            @click="reveal = false"
            icon="mdi-power-settings"
            color="info"
            v-tooltip:bottom="'Wake On Lan'"
          >
          </v-btn>
          <v-btn
            @click="reveal = false"
            icon="mdi-power"
            color="red"
            v-tooltip:bottom="'Power Off'"
          >
          </v-btn>
          <v-btn
            @click="reveal = false"
            icon="mdi-restart"
            color="warning"
            v-tooltip:bottom="'Reboot'"
          >
          </v-btn>
        </div>
        <v-divider class="ma-3"></v-divider>
        <div class="d-flex align-center justify-center ga-2">
          <v-btn
            @click="reveal = false"
            icon="mdi-account-cowboy-hat"
            color="grey"
            v-tooltip:bottom="'Start Admin'"
          >
          </v-btn>
          <v-btn
            @click="reveal = false"
            icon="mdi-account-clock"
            color="blue"
            v-tooltip:bottom="'Open Session'"
          >
          </v-btn>
          <v-btn
            @click="reveal = false"
            icon="mdi-cash-multiple"
            color="warning"
            v-tooltip:bottom="'Start Session'"
          >
          </v-btn>
        </div>
      </v-card>
    </v-expand-transition>
  </v-card>
</template>

<script setup>
import { ref, watch } from "vue";

const reveal = ref(false);
const timeOutID = ref(null);

const props = defineProps({
  pcData: {
    type: Object,
    required: true,
  },
});

const statusColors = {
  active: "success",
  idle: "info",
  runningOut: "warning",
};

watch(reveal, async (newReveal, oldReveal) => {
  if (newReveal) {
    timeOutID.value = setTimeout(() => {
      reveal.value = false;
    }, 3000);
  } else {
    clearTimeout(timeOutID.value);
  }
});
</script>
