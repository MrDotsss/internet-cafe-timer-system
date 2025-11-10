import { defineStore } from "pinia";
import { socket } from "@/socket";
import axios from "axios";

export const useClientStore = defineStore("client", {
  state: () => {
    return {
      pcList: [],
    };
  },
  actions: {
    bindEvents() {
      socket.on("client:update", (data) => {
        this.pcList = data;
      });

      socket.on("session:start", (data) => {
        this.pcList.forEach((pc) => {
          if (pc.id == data.pcId) {
            pc.status = "active";
          }
        });
      });

      socket.on("client:expired", (data) => {
        this.pcList.forEach((pc) => {
          if (pc.id == data.pcId) {
            pc.status = "idle";
          }
        });
      });

      socket.on("client:join", (data) => {
        this.getPCList();
      });
    },

    async getPCList() {
      try {
        const response = await axios.get("http://localhost:8080/api/clients/");
        this.pcList = response.data;
      } catch (err) {
        console.error("Couldn't get PCLISTS: ", { err });
      }
    },
  },
});
