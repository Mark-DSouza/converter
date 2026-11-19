/// <reference types="vitest/config" />
import { defineConfig } from "vite";

export default defineConfig({
  // Served from https://mark-dsouza.github.io/converter/
  base: "/converter/",
  test: {
    include: ["src/**/*.test.ts"],
  },
});
