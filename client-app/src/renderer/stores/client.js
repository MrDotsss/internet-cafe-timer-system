import { defineStore } from "pinia";

export const useClientStore = defineStore("client", {
  state: () => ({
    clients: [],
  }),
  actions: {
    addClient(client) {
      this.clients.push(client);
    },
  },
});
