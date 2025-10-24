import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    headers: {
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; connect-src *;",
    },
  },
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 1500,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
