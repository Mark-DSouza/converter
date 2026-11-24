import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("./");
});

const distanceCard = (page: Page) => {
  const card = page.getByRole("region", { name: "Distance" });
  return {
    card,
    km: card.getByLabel("Kilometres"),
    mi: card.getByLabel("Miles"),
  };
};

test("comes after the BMI card", async ({ page }) => {
  const titles = await page.locator("main > section h2").allTextContents();
  expect(titles.indexOf("Distance")).toBe(titles.indexOf("BMI") + 1);
});

test("typing kilometres shows miles", async ({ page }) => {
  const { km, mi } = distanceCard(page);
  await km.fill("10");
  await expect(mi).toHaveValue("6.21");
});

test("typing miles shows kilometres", async ({ page }) => {
  const { km, mi } = distanceCard(page);
  await mi.fill("26.2");
  await expect(km).toHaveValue("42.16");
});

test("leaves the field being edited exactly as typed", async ({ page }) => {
  const { km, mi } = distanceCard(page);
  await mi.fill("1,5");
  await expect(mi).toHaveValue("1,5");
  await expect(km).toHaveValue("2.41");
  await km.fill("5");
  await expect(mi).toHaveValue("3.11");
  await expect(km).toHaveValue("5");
});

test("clearing, zero or text that isn't a number blanks the other field", async ({ page }) => {
  const { km, mi } = distanceCard(page);
  for (const text of ["", "0", ".", "1.2.3"]) {
    await km.fill("10");
    await expect(mi).toHaveValue("6.21");
    await km.fill(text);
    await expect(mi).toHaveValue("");

    await mi.fill("1");
    await expect(km).toHaveValue("1.61");
    await mi.fill(text);
    await expect(km).toHaveValue("");
  }
});

test("does not accept negative or non-numeric characters", async ({ page }) => {
  const { km, mi } = distanceCard(page);
  await mi.pressSequentially("-3a");
  await expect(mi).toHaveValue("3");
  await expect(km).toHaveValue("4.83");
});

test("asks for a numeric keyboard", async ({ page }) => {
  const { km, mi } = distanceCard(page);
  await expect(km).toHaveAttribute("inputmode", "decimal");
  await expect(mi).toHaveAttribute("inputmode", "decimal");
});

test("filled Distance card looks right", async ({ page }) => {
  const { km } = distanceCard(page);
  await km.fill("10");
  // Screenshot the resting state, so focus-style changes don't churn this baseline.
  await km.blur();
  await expect(page).toHaveScreenshot("distance-filled.png", { fullPage: true });
});
