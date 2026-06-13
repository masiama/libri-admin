import "./assets/main.css";
import { clerkPlugin, useAuth } from "@clerk/vue";
import ui from "@nuxt/ui/vue-plugin";
import * as Sentry from "@sentry/vue";
import { until } from "@vueuse/core";
import { createPinia } from "pinia";
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

router.beforeEach(async (to, _from) => {
  const { isSignedIn, isLoaded } = useAuth();
  await until(isLoaded).toBe(true);

  if (!isSignedIn.value && to.path !== "/login") {
    return { path: "/login", query: { redirect: to.fullPath } };
  }

  if (isSignedIn.value && to.path === "/login") {
    return { path: "/" };
  }
});

const app = createApp(App);

Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  dataCollection: { userInfo: false },
  integrations: [Sentry.browserTracingIntegration({ router })],
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  tracePropagationTargets: ["localhost"],
  enableLogs: true,
});

const pinia = createPinia();

pinia.use(({ store }) => {
  store.$onAction(({ name, onError }) => {
    onError((error) => {
      Sentry.withScope((scope) => {
        scope.setTag("store", store.$id);
        scope.setTag("action", name);
        scope.setContext("store_state", store.$state);
        Sentry.captureException(error);
      });
    });
  });
});

app
  .use(ui)
  .use(pinia)
  .use(clerkPlugin, { publishableKey: PUBLISHABLE_KEY })
  .use(router)
  .mount("#app");
