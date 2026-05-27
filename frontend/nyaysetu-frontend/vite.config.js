import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  define: {
    global: "globalThis",
    "global.crypto": "globalThis.crypto",
  },

  resolve: {
    alias: {
      crypto: "crypto-browserify",
    },
  },
});