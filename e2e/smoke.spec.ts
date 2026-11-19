import { expect, test } from "@playwright/test";

test("shows the Converter page", async ({ page }) => {
  await page.goto("./");
  await expect(page).toHaveTitle("Converter");
  await expect(page.getByRole("heading", { level: 1, name: "Converter" })).toBeVisible();
});

test("empty page looks right", async ({ page }) => {
  await page.goto("./");
  await expect(page).toHaveScreenshot("empty.png", { fullPage: true });
});
