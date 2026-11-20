import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("./");
});

const heightCard = (page: Page) => {
  const card = page.getByRole("region", { name: "Height" });
  return {
    card,
    metres: card.getByLabel("Metres"),
    feet: card.getByLabel("Feet"),
    inches: card.getByLabel("Inches"),
  };
};

test("typing metres shows feet and inches", async ({ page }) => {
  const { metres, feet, inches } = heightCard(page);
  await metres.fill("1.75");
  await expect(feet).toHaveValue("5");
  await expect(inches).toHaveValue("8.90");
});

test("typing feet and inches shows metres", async ({ page }) => {
  const { metres, feet, inches } = heightCard(page);
  await feet.fill("5");
  await inches.fill("9");
  await expect(metres).toHaveValue("1.75");
});

test("editing feet leaves the inches field alone", async ({ page }) => {
  const { metres, feet, inches } = heightCard(page);
  await inches.fill("9");
  await feet.fill("6");
  await expect(inches).toHaveValue("9");
  await expect(metres).toHaveValue("2.06");
});

test("inches of 12 or more carry into feet", async ({ page }) => {
  const { metres, feet, inches } = heightCard(page);
  await feet.fill("5");
  await inches.fill("14");
  await expect(metres).toHaveValue("1.88");
  await feet.fill("6");
  await inches.fill("2");
  await expect(metres).toHaveValue("1.88");
});

test("feet only or inches only is enough", async ({ page }) => {
  const { metres, feet, inches } = heightCard(page);
  await feet.fill("6");
  await expect(metres).toHaveValue("1.83");
  await feet.fill("");
  await inches.fill("70");
  await expect(metres).toHaveValue("1.78");
});

test("leaves the field being edited exactly as typed", async ({ page }) => {
  const { metres, inches } = heightCard(page);
  await metres.pressSequentially("1.8");
  await expect(metres).toHaveValue("1.8");
  await expect(inches).toHaveValue("10.87");
  await inches.fill("8,5");
  await expect(inches).toHaveValue("8,5");
});

test("empty, zero or invalid input blanks the converted values", async ({ page }) => {
  const { metres, feet, inches } = heightCard(page);
  for (const text of ["", "0", ".", "1.2.3"]) {
    await metres.fill("1.75");
    await expect(feet).toHaveValue("5");
    await metres.fill(text);
    await expect(feet).toHaveValue("");
    await expect(inches).toHaveValue("");
  }
  await feet.fill("5");
  await inches.fill("9");
  await expect(metres).toHaveValue("1.75");
  await feet.fill("");
  await inches.fill("");
  await expect(metres).toHaveValue("");
});

test("a malformed feet or inches value blanks metres, even if the other is valid", async ({ page }) => {
  const { metres, feet, inches } = heightCard(page);
  await inches.fill("9");
  for (const text of [".", "1.2.3"]) {
    await feet.fill("5");
    await expect(metres).toHaveValue("1.75");
    await feet.fill(text);
    await expect(metres).toHaveValue("");
  }
  await feet.fill("5");
  await inches.fill("1,2,3");
  await expect(metres).toHaveValue("");
});

test("zero is fine in one field, but a zero total blanks metres", async ({ page }) => {
  const { metres, feet, inches } = heightCard(page);
  await feet.fill("0");
  await inches.fill("9");
  await expect(metres).toHaveValue("0.23");
  await inches.fill("0");
  await expect(metres).toHaveValue("");
});

test("does not accept negative or non-numeric characters", async ({ page }) => {
  const { metres, feet } = heightCard(page);
  await metres.pressSequentially("-1.8m");
  await expect(metres).toHaveValue("1.8");
  await expect(feet).toHaveValue("5");
});

test("asks for a numeric keyboard", async ({ page }) => {
  const { metres, feet, inches } = heightCard(page);
  for (const field of [metres, feet, inches]) {
    await expect(field).toHaveAttribute("inputmode", "decimal");
  }
});

test("filled Height card looks right", async ({ page }) => {
  const { metres } = heightCard(page);
  await metres.fill("1.75");
  await metres.blur();
  await expect(page).toHaveScreenshot("height-filled.png", { fullPage: true });
});
