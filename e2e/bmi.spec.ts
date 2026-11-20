import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("./");
});

const page$ = (page: Page) => {
  const weight = page.getByRole("region", { name: "Weight" });
  const height = page.getByRole("region", { name: "Height" });
  const bmi = page.getByRole("region", { name: "BMI" });
  return {
    kg: weight.getByLabel("Kilograms"),
    lb: weight.getByLabel("Pounds"),
    metres: height.getByLabel("Metres"),
    feet: height.getByLabel("Feet"),
    inches: height.getByLabel("Inches"),
    value: bmi.getByLabel("BMI", { exact: true }),
    who: bmi.getByLabel("WHO", { exact: true }),
    asian: bmi.getByLabel("Asian", { exact: true }),
    perPoint: bmi.getByLabel("One BMI point", { exact: true }),
    down: bmi.getByLabel("Next BMI down", { exact: true }),
    up: bmi.getByLabel("Next BMI up", { exact: true }),
  };
};

test("shows what one BMI point weighs and the next whole BMI down and up", async ({ page }) => {
  const p = page$(page);
  await p.kg.fill("72");
  await p.metres.fill("1.75");
  await expect(p.value).toHaveText("23.51");
  await expect(p.perPoint).toHaveText("1 BMI point = 3.06 kg / 6.75 lb at your height");
  await expect(p.down).toHaveText("↓ BMI 23.00 at 70.44 kg / 155.29 lb (−1.56 kg)");
  await expect(p.up).toHaveText("↑ BMI 24.00 at 73.50 kg / 162.04 lb (+1.50 kg)");
});

test("at an exact whole BMI, targets the whole numbers either side", async ({ page }) => {
  const p = page$(page);
  await p.kg.fill("73.5");
  await p.metres.fill("1.75");
  await expect(p.value).toHaveText("24.00");
  await expect(p.down).toHaveText("↓ BMI 23.00 at 70.44 kg / 155.29 lb (−3.06 kg)");
  await expect(p.up).toHaveText("↑ BMI 25.00 at 76.56 kg / 168.79 lb (+3.06 kg)");
});

test("hides the per-point and target lines while the card is blank", async ({ page }) => {
  const p = page$(page);
  await p.kg.fill("72");
  await p.metres.fill("1.75");
  await expect(p.up).toBeVisible();
  await p.kg.fill("");
  await expect(p.perPoint).toBeHidden();
  await expect(p.down).toBeHidden();
  await expect(p.up).toBeHidden();
});

test("shows BMI and both categories from metric weight and height", async ({ page }) => {
  const p = page$(page);
  await p.kg.fill("70");
  await p.metres.fill("1.75");
  await expect(p.value).toHaveText("22.86");
  await expect(p.who).toHaveText("Normal");
  await expect(p.asian).toHaveText("Normal");
});

test("shows WHO and Asian categories side by side when they differ", async ({ page }) => {
  const p = page$(page);
  await p.kg.fill("72");
  await p.metres.fill("1.73");
  await expect(p.value).toHaveText("24.06");
  await expect(p.who).toHaveText("Normal");
  await expect(p.asian).toHaveText("Overweight");
});

test("imperial input gives the same BMI as the metric equivalent", async ({ page }) => {
  const p = page$(page);
  await p.lb.fill("160");
  await p.feet.fill("5");
  await p.inches.fill("9");
  await expect(p.value).toHaveText("23.63");

  await page.reload();
  await p.kg.fill("72.5747792"); // 160 lb
  await p.metres.fill("1.7526"); // 5 ft 9 in
  await expect(p.value).toHaveText("23.63");
});

test("stays blank until both weight and height are present", async ({ page }) => {
  const p = page$(page);
  await p.kg.fill("70");
  await expect(p.value).toHaveText("");
  await p.kg.fill("");
  await p.metres.fill("1.75");
  await expect(p.value).toHaveText("");
  await expect(p.who).toHaveText("");
  await expect(p.asian).toHaveText("");
});

test("updates live and blanks again when an input becomes invalid", async ({ page }) => {
  const p = page$(page);
  await p.kg.fill("70");
  await p.metres.fill("1.75");
  await expect(p.value).toHaveText("22.86");
  await p.kg.fill("95");
  await expect(p.value).toHaveText("31.02");
  await expect(p.who).toHaveText("Obese I");
  await p.metres.fill("0");
  await expect(p.value).toHaveText("");
  await p.metres.fill("1.75");
  await p.lb.fill("");
  await expect(p.value).toHaveText("");
});

test("long categories fit a 320 px phone without sideways scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  const p = page$(page);
  await p.metres.fill("1.75");
  for (const [kg, who] of [["130", "Obese III"], ["50", "Underweight"]] as const) {
    await p.kg.fill(kg);
    await expect(p.who).toHaveText(who);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  }
});

test("filled BMI card with differing categories looks right", async ({ page }) => {
  const p = page$(page);
  await p.kg.fill("72");
  await p.metres.fill("1.73");
  await p.metres.blur();
  await expect(page).toHaveScreenshot("bmi-differing.png", { fullPage: true });
});
