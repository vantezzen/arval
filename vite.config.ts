/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  assetsInclude: ["**/*.onnx"],

  optimizeDeps: {
    exclude: ["onnxruntime-web"],
  },

  server: {
    allowedHosts: [".ngrok-free.app"],
  },

  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],

    coverage: {
      reporter: ["html"],
      include: ["src/lib/validation"],
    },
  },
});
