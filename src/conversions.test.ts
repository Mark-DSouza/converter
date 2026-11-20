import { describe, expect, it } from "vitest";
import {
  feetInchesToMetres,
  formatValue,
  kgToLb,
  lbToKg,
  metresToFeetInches,
  parseMeasurement,
} from "./conversions";

describe("height conversion", () => {
  it("converts metres to whole feet and remaining inches", () => {
    const height = metresToFeetInches(1.75);
    expect(height.feet).toBe(5);
    expect(height.inches).toBeCloseTo(8.9, 2);
  });

  it("never shows 12.00 inches: rounding up carries into the next foot", () => {
    const height = metresToFeetInches(1.8287492); // 71.998 in
    expect(height.feet).toBe(6);
    expect(formatValue(height.inches)).toBe("0.00");
  });

  it("converts feet and inches to metres", () => {
    expect(feetInchesToMetres(5, 9)).toBeCloseTo(1.7526, 9);
  });

  it("carries inches of 12 or more into feet", () => {
    expect(feetInchesToMetres(5, 14)).toBeCloseTo(1.8796, 9);
    expect(feetInchesToMetres(6, 2)).toBeCloseTo(1.8796, 9);
  });

  it("accepts feet only or inches only", () => {
    expect(feetInchesToMetres(6, 0)).toBeCloseTo(1.8288, 9);
    expect(feetInchesToMetres(0, 70)).toBeCloseTo(1.778, 9);
  });
});

describe("reading a measurement typed by the user", () => {
  it("reads whole and decimal numbers", () => {
    expect(parseMeasurement("72")).toBe(72);
    expect(parseMeasurement("72.4")).toBe(72.4);
    expect(parseMeasurement(" 72.4 ")).toBe(72.4);
  });

  it("accepts a comma as the decimal separator", () => {
    expect(parseMeasurement("72,4")).toBe(72.4);
  });

  it("treats empty, zero, negative and non-numeric input as no value", () => {
    expect(parseMeasurement("")).toBeNull();
    expect(parseMeasurement("   ")).toBeNull();
    expect(parseMeasurement("0")).toBeNull();
    expect(parseMeasurement("0.00")).toBeNull();
    expect(parseMeasurement("-5")).toBeNull();
    expect(parseMeasurement("abc")).toBeNull();
    expect(parseMeasurement("7a")).toBeNull();
    expect(parseMeasurement(".")).toBeNull();
    expect(parseMeasurement("1.2.3")).toBeNull();
  });
});

describe("display formatting", () => {
  it("shows two decimal places", () => {
    expect(formatValue(154.3235835294143)).toBe("154.32");
    expect(formatValue(159.61467782185136)).toBe("159.61");
  });

  it("rounds to the nearest hundredth", () => {
    expect(formatValue(45.359237)).toBe("45.36");
    expect(formatValue(72.5747792)).toBe("72.57");
  });

  it("rounds half-way values up, despite binary floating point", () => {
    expect(formatValue(1.005)).toBe("1.01");
    expect(formatValue(2.675)).toBe("2.68");
    expect(formatValue(1.125)).toBe("1.13");
  });

  it("keeps trailing zeros so every value has two decimals", () => {
    expect(formatValue(70)).toBe("70.00");
    expect(formatValue(1.5)).toBe("1.50");
  });
});

describe("weight conversion", () => {
  it("converts kilograms to pounds", () => {
    expect(kgToLb(70)).toBeCloseTo(154.3235835, 6);
  });

  it("converts pounds to kilograms", () => {
    expect(lbToKg(100)).toBeCloseTo(45.359237, 9);
  });

  it("does not drift when converted back and forth repeatedly", () => {
    let kg = 72.4;
    for (let i = 0; i < 1000; i++) kg = lbToKg(kgToLb(kg));
    expect(kg).toBeCloseTo(72.4, 9);
  });
});
