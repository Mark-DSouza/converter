/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// Served from https://mark-dsouza.github.io/converter/
const BASE = "/converter/";

// Light-theme background from the design tokens (src/styles.css).
const BACKGROUND = "#f5f6f8";

export default defineConfig({
  base: BASE,
  plugins: [
    VitePWA({
      // New versions activate on the next visit; there is no in-app update prompt.
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon-180x180.png"],
      manifest: {
        name: "Converter",
        short_name: "Converter",
        description: "Quick weight, height and BMI conversions.",
        start_url: BASE,
        scope: BASE,
        display: "standalone",
        theme_color: BACKGROUND,
        background_color: BACKGROUND,
        // Generated from public/icon.svg by `npm run generate-icons`.
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Precache the whole app (including the bundled font) so it works offline.
        globPatterns: ["**/*.{html,js,css,woff2,png,svg,ico}"],
      },
    }),
  ],
  test: {
    include: ["src/**/*.test.ts"],
  },
});
