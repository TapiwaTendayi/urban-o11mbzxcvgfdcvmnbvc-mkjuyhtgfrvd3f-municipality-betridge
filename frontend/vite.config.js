import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,           // You changed to 8080 (that's fine!)
    host: true,            // This allows network access
    proxy: {
      "/api": "http://localhost:5000"  // This forwards API calls to your backend
    }
  }
});