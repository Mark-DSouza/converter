import { expect, test, type Page } from "@playwright/test";

/** Waits until a service worker controls the page (first load installs it; a reload hands control over). */
async function controlledByServiceWorker(page: Page) {
  await page.goto("./");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);
}

test("serves a web app manifest under /converter/ with installable icons", async ({ page, request }) => {
  await page.goto("./");
  const href = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(href).toBeTruthy();
  const manifestUrl = new URL(href!, page.url()).toString();
  const response = await request.get(manifestUrl);
  expect(response.ok()).toBe(true);

  const manifest = await response.json();
  expect(manifest).toMatchObject({
    name: "Converter",
    short_name: "Converter",
    start_url: "/converter/",
    scope: "/converter/",
    display: "standalone",
  });

  // The page's theme colours come from the same source as the manifest's.
  const themeColor = (scheme: string) =>
    page.locator(`meta[name="theme-color"][media="(prefers-color-scheme: ${scheme})"]`).getAttribute("content");
  expect(await themeColor("light")).toBe(manifest.theme_color);
  expect(await themeColor("dark")).toBe("#111317");

  const icons: { src: string; sizes: string; type: string; purpose?: string }[] = manifest.icons;
  const has = (sizes: string, purpose?: string) =>
    icons.some((icon) => icon.sizes === sizes && icon.type === "image/png" && (purpose ? icon.purpose === purpose : true));
  expect(has("192x192")).toBe(true);
  expect(has("512x512")).toBe(true);
  expect(has("512x512", "maskable")).toBe(true);

  for (const icon of icons) {
    const iconResponse = await request.get(new URL(icon.src, manifestUrl).toString());
    expect(iconResponse.ok(), icon.src).toBe(true);
    expect(iconResponse.headers()["content-type"]).toBe("image/png");
  }
});

test("meets Chrome's installability criteria", async ({ page }) => {
  await controlledByServiceWorker(page);
  const cdp = await page.context().newCDPSession(page);
  const { installabilityErrors } = await cdp.send("Page.getInstallabilityErrors");
  expect(installabilityErrors).toEqual([]);
});

test("registers a service worker scoped to /converter/", async ({ page }) => {
  await controlledByServiceWorker(page);
  const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
  expect(new URL(scope).pathname).toBe("/converter/");
});

test("works offline after the first visit", async ({ page, context }) => {
  await controlledByServiceWorker(page);
  await context.setOffline(true);
  await page.reload();

  await expect(page.getByRole("heading", { level: 1, name: "Converter" })).toBeVisible();
  await page.getByRole("region", { name: "Weight" }).getByLabel("Kilograms").fill("70");
  await expect(page.getByRole("region", { name: "Weight" }).getByLabel("Pounds")).toHaveValue("154.32");
  await page.getByRole("region", { name: "Height" }).getByLabel("Metres").fill("1.75");
  await expect(page.getByRole("region", { name: "BMI" }).getByLabel("BMI", { exact: true })).toHaveText("22.86");
  await expect(page.locator("body")).toHaveCSS("font-family", /Inter Variable/);
});

test("stores no user data on the device", async ({ page }) => {
  await controlledByServiceWorker(page);
  await page.getByRole("region", { name: "Weight" }).getByLabel("Kilograms").fill("70");
  await page.getByRole("region", { name: "Height" }).getByLabel("Metres").fill("1.75");

  const stored = await page.evaluate(async () => ({
    local: localStorage.length,
    session: sessionStorage.length,
    indexedDb: (await indexedDB.databases()).map((db) => db.name),
    cookies: document.cookie,
  }));
  expect(stored).toEqual({ local: 0, session: 0, indexedDb: [], cookies: "" });

  await page.reload();
  await expect(page.getByRole("region", { name: "Weight" }).getByLabel("Kilograms")).toHaveValue("");
  await expect(page.getByRole("region", { name: "Height" }).getByLabel("Metres")).toHaveValue("");
});
