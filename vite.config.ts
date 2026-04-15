import { fileURLToPath, URL } from "node:url";

import ui from "@nuxt/ui/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import vueDevTools from "vite-plugin-vue-devtools";
import svgLoader from "vite-svg-loader";
import vueRouter from "vue-router/vite";

export default defineConfig({
  plugins: [
    vueRouter(),
    vue(),
    vueDevTools(),
    ui({
      ui: {
        colors: {
          primary: "primary",
          secondary: "secondary",
          success: "success",
          info: "info",
          warning: "warning",
          error: "error",
          neutral: "neutral",
        },
      },
    }),
    svgLoader(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 3000,
    open: true,
  },
});
