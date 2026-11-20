import { describe, expect, it } from "vitest";
import { bmiReport } from "./bmi";

describe("BMI report", () => {
  it("calculates BMI from height in metres and weight in kg", () => {
    expect(bmiReport(1.75, 70).bmi).toBeCloseTo(22.857142857, 9);
    expect(bmiReport(1.73, 72).bmi).toBeCloseTo(24.056934746, 9);
  });

  // With a height of 1 m, BMI equals the weight, so boundaries can be hit exactly.
  const atBmi = (bmi: number) => bmiReport(1, bmi);

  it.each([
    [18.49, "Underweight"],
    [18.5, "Normal"],
    [24.99, "Normal"],
    [25, "Overweight"],
    [29.99, "Overweight"],
    [30, "Obese I"],
    [34.99, "Obese I"],
    [35, "Obese II"],
    [39.99, "Obese II"],
    [40, "Obese III"],
  ])("classifies BMI %d as WHO %s", (bmi, category) => {
    expect(atBmi(bmi).who).toBe(category);
  });

  it.each([
    [18.49, "Underweight"],
    [18.5, "Normal"],
    [22.99, "Normal"],
    [23, "Overweight"],
    [24.99, "Overweight"],
    [25, "Obese I"],
    [29.99, "Obese I"],
    [30, "Obese II"],
    [45, "Obese II"],
  ])("classifies BMI %d as Asian %s", (bmi, category) => {
    expect(atBmi(bmi).asian).toBe(category);
  });

  it("classifies the BMI as displayed (2 dp), so the number and category agree", () => {
    // 24.996 is shown as 25.00, so it must read Overweight, not Normal.
    expect(atBmi(24.996).who).toBe("Overweight");
    expect(atBmi(22.996).asian).toBe("Overweight");
    // 24.994 is shown as 24.99: still Normal.
    expect(atBmi(24.994).who).toBe("Normal");
  });
});
