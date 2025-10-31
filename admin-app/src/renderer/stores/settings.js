import { defineStore } from "pinia";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    minutesPerCoin: 6,
    maxPCs: 12,
  }),
});
