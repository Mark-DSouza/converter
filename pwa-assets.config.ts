import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

// Generates the PWA icons in public/ from public/icon.svg: `npm run generate-icons`.
// The SVG is full-bleed, so no padding is added; its artwork already sits
// inside the maskable safe zone.
export default defineConfig({
  preset: {
    ...minimal2023Preset,
    transparent: { ...minimal2023Preset.transparent, padding: 0 },
    maskable: { ...minimal2023Preset.maskable, padding: 0 },
    apple: { ...minimal2023Preset.apple, padding: 0 },
  },
  images: ["public/icon.svg"],
});
