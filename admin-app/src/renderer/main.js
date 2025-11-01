import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import { useSocket } from "./composables/useSocket.js";
import { router } from "./router/index.js";

const app = createApp(App);
const pinia = createPinia();

// Initialize socket once globally
const { socket, isConnected } = useSocket();
app.provide("socket", socket);
app.provide("isConnected", isConnected);

app.use(pinia);
app.use(router);
app.mount("#app");
