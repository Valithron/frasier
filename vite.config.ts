import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Frasier Quote Archive",
        short_name: "Frasier",
        description: "Cydney's offline Frasier quotation archive",
        theme_color: "#271e1a",
        background_color: "#f4eddf",
        display: "standalone",
        start_url: "/",
        icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }]
      },
      workbox: { navigateFallback: "/index.html", globPatterns: ["**/*.{js,css,html,svg,json}"] }
    })
  ],
  build: { outDir: "dist" }
});
