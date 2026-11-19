import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}/converter/`;

const phone = devices["Pixel 7"];
const desktop = devices["Desktop Chrome"];

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // No retries: a flaky test must fail the run, never pass on a second try and deploy.
  retries: 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  // Visual baselines are only valid when produced inside the pinned
  // Playwright Docker image (scripts/e2e-docker.sh locally, the same image
  // in CI), so there is exactly one platform and no platform suffix.
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}-{projectName}{ext}",
  projects: [
    { name: "phone-light", use: { ...phone, colorScheme: "light" } },
    { name: "phone-dark", use: { ...phone, colorScheme: "dark" } },
    { name: "desktop-light", use: { ...desktop, colorScheme: "light" } },
    { name: "desktop-dark", use: { ...desktop, colorScheme: "dark" } },
  ],
  webServer: {
    // Tests run against the production build (`npm run build` first), not the dev server.
    command: "npm run preview",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
  },
});
