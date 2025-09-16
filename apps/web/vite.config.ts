import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Azure Functions local écoute par défaut sur 7071 avec le préfixe /api
      "/api": {
        target: "http://localhost:7071",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
  },
});
