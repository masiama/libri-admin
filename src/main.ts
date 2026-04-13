import "./assets/css/main.css";
import { clerkPlugin } from "@clerk/vue";
import ui from "@nuxt/ui/vue-plugin";
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";

import App from "./App.vue";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

const router = createRouter({
  history: createWebHistory(),
  routes,
});

createApp(App)
  .use(router)
  .use(ui)
  .use(clerkPlugin, { publishableKey: PUBLISHABLE_KEY })
  .mount("#app");
