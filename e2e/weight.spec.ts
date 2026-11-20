import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("./");
});

const weightCard = (page: import("@playwright/test").Page) =>
  page.getByRole("region", { name: "Weight" });

test("typing kilograms shows pounds", async ({ page }) => {
  const card = weightCard(page);
  await card.getByLabel("Kilograms").fill("70");
  await expect(card.getByLabel("Pounds")).toHaveValue("154.32");
});

test("typing pounds shows kilograms", async ({ page }) => {
  const card = weightCard(page);
  await card.getByLabel("Pounds").fill("160");
  await expect(card.getByLabel("Kilograms")).toHaveValue("72.57");
});

test("works in both directions in the same session", async ({ page }) => {
  const card = weightCard(page);
  await card.getByLabel("Kilograms").fill("70");
  await card.getByLabel("Pounds").fill("100");
  await expect(card.getByLabel("Kilograms")).toHaveValue("45.36");
  await expect(card.getByLabel("Pounds")).toHaveValue("100");
});

test("leaves the field being edited exactly as typed", async ({ page }) => {
  const card = weightCard(page);
  const kg = card.getByLabel("Kilograms");
  await kg.pressSequentially("70.5");
  await expect(kg).toHaveValue("70.5");
  await kg.fill("72,4");
  await expect(kg).toHaveValue("72,4");
  await expect(card.getByLabel("Pounds")).toHaveValue("159.61");
});

test("clearing or entering zero blanks the other field", async ({ page }) => {
  const card = weightCard(page);
  const kg = card.getByLabel("Kilograms");
  const lb = card.getByLabel("Pounds");
  await kg.fill("70");
  await expect(lb).toHaveValue("154.32");
  await kg.fill("");
  await expect(lb).toHaveValue("");
  await kg.fill("0");
  await expect(lb).toHaveValue("");
});

test("text that isn't a number blanks the other field", async ({ page }) => {
  const card = weightCard(page);
  const kg = card.getByLabel("Kilograms");
  const lb = card.getByLabel("Pounds");
  for (const text of [".", "1.2.3", "1,2,3"]) {
    await kg.fill("70");
    await expect(lb).toHaveValue("154.32");
    await kg.fill(text);
    await expect(lb).toHaveValue("");
  }
});

test("does not accept negative or non-numeric characters", async ({ page }) => {
  const card = weightCard(page);
  const kg = card.getByLabel("Kilograms");
  await kg.pressSequentially("-5a");
  await expect(kg).toHaveValue("5");
  await expect(card.getByLabel("Pounds")).toHaveValue("11.02");
});

test("asks for a numeric keyboard", async ({ page }) => {
  const card = weightCard(page);
  await expect(card.getByLabel("Kilograms")).toHaveAttribute("inputmode", "decimal");
  await expect(card.getByLabel("Pounds")).toHaveAttribute("inputmode", "decimal");
});

test("filled Weight card looks right", async ({ page }) => {
  const kg = weightCard(page).getByLabel("Kilograms");
  await kg.fill("70");
  // Screenshot the resting state, so focus-style changes don't churn this baseline.
  await kg.blur();
  await expect(page).toHaveScreenshot("weight-filled.png", { fullPage: true });
});
