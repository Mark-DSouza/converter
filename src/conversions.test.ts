import { describe, expect, it } from "vitest";
import { formatValue, kgToLb, lbToKg, parseMeasurement } from "./conversions";

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
