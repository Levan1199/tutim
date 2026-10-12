import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { demoCourses } from "./src/demoData.js";
const backend = process.env.API_PROXY_TARGET || "http://localhost:3000";
export default defineConfig(({ mode }) => ({
  base: mode === "demo" ? process.env.PAGES_BASE_PATH || "/tutim/" : "/",
  plugins: [
    react(),
    ...(mode === "demo"
      ? [
          {
            name: "demo-course-artwork",
            generateBundle() {
              // Copy only bundled illustrations, never runtime uploads or secrets.
              for (const imgPath of [
                ...demoCourses.map((course) => course.imgPath),
                "header.jpg",
              ]) {
                this.emitFile({
                  type: "asset",
                  fileName: "demo/coursesImg/" + imgPath,
                  source: readFileSync(
                    new URL(
                      "../server/public/coursesImg/" + imgPath,
                      import.meta.url,
                    ),
                  ),
                });
              }
            },
          },
        ]
      : []),
  ],
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
}));
