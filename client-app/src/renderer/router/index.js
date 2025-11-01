import { createRouter, createWebHashHistory } from "vue-router";
import Dashboard from "../pages/Dashboard.vue";
import Clients from "../pages/Clients.vue";
import Settings from "../pages/Settings.vue";

const routes = [
  { path: "/", name: "dashboard", component: Dashboard },
  { path: "/clients", name: "clients", component: Clients },
  { path: "/settings", name: "settings", component: Settings },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
