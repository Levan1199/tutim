import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
const backend = process.env.API_PROXY_TARGET || "http://localhost:3000";
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        strictExecutionOrder: true,
        codeSplitting: {
          groups: [
            {
              name: "react",
              test: /node_modules[\/](react|react-dom|scheduler)[\/]/,
              priority: 30,
            },
            {
              name: "ui",
              test: /node_modules[\/](@mui|@emotion)[\/]/,
              priority: 20,
            },
            {
              name: "vendor",
              test: /node_modules/,
              maxSize: 250000,
              priority: 10,
            },
          ],
        },
      },
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3001,
    strictPort: true,
    allowedHosts: ["host.docker.internal"],
    proxy: {
      "/api": {
        target: backend,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      ...Object.fromEntries(
        ["images", "coursesImg", "homeImg"].map((dir) => [
          "/" + dir,
          { target: backend, changeOrigin: true },
        ]),
      ),
    },
  },
});
