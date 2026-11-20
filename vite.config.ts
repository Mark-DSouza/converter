/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// Served from https://mark-dsouza.github.io/converter/
const BASE = "/converter/";

/**
 * Single source for the PWA's colours: the manifest and the page's
 * theme-color tags. They mirror --color-bg in src/styles.css (light and dark
 * themes); keep them in sync if the design tokens change.
 */
const PAGE_BACKGROUND = { light: "#f5f6f8", dark: "#111317" } as const;

/** Injects one theme-color meta tag per colour scheme, so browser chrome matches the page. */
function themeColorTags(): Plugin {
  return {
    name: "converter:theme-color",
    transformIndexHtml: () =>
      Object.entries(PAGE_BACKGROUND).map(([scheme, color]) => ({
        tag: "meta",
        attrs: { name: "theme-color", content: color, media: `(prefers-color-scheme: ${scheme})` },
        injectTo: "head",
      })),
  };
}

export default defineConfig({
  base: BASE,
  plugins: [
    themeColorTags(),
    VitePWA({
      // New versions activate on the next visit; there is no in-app update prompt.
      registerType: "autoUpdate",
      manifest: {
        name: "Converter",
        short_name: "Converter",
        description: "Quick weight, height and BMI conversions.",
        start_url: BASE,
        scope: BASE,
        display: "standalone",
        // The installed app's status bar and splash screen use the light page background.
        theme_color: PAGE_BACKGROUND.light,
        background_color: PAGE_BACKGROUND.light,
        // Generated from public/icon.svg by `npm run generate-icons`.
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Precache the whole app (including the bundled font and icons) so it works offline.
        globPatterns: ["**/*.{html,js,css,woff2,png,svg,ico}"],
      },
    }),
  ],
  test: {
    include: ["src/**/*.test.ts"],
  },
});
