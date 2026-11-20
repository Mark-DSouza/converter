import { describe, expect, it } from "vitest";
import { bmiReport } from "./conversions";

describe("BMI report", () => {
  it("calculates BMI from height in metres and weight in kg", () => {
    expect(bmiReport({ heightM: 1.75, weightKg: 70 }).bmi).toBeCloseTo(22.857142857, 9);
    expect(bmiReport({ heightM: 1.73, weightKg: 72 }).bmi).toBeCloseTo(24.056934746, 9);
  });

  // With a height of 1 m, BMI equals the weight, so boundaries can be hit exactly.
  const atBmi = (bmi: number) => bmiReport({ heightM: 1, weightKg: bmi });

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
    [35, "Obese II"],
    [40, "Obese II"],
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
    // The lower edge: 18.495 is shown as 18.50, so Normal in both tables.
    expect(atBmi(18.495).who).toBe("Normal");
    expect(atBmi(18.495).asian).toBe("Normal");
    expect(atBmi(18.494).who).toBe("Underweight");
  });
});
