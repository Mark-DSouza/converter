import { describe, expect, it } from "vitest";
import {
  feetInchesFromText,
  formatDifference,
  feetInchesToMetres,
  formatValue,
  kgToLb,
  kmToMi,
  lbToKg,
  metresToFeetInches,
  miToKm,
  parseMeasurement,
} from "./conversions";

describe("height conversion", () => {
  it("converts metres to whole feet and remaining inches", () => {
    const height = metresToFeetInches(1.75);
    expect(height.feet).toBe(5);
    expect(formatValue(height.inches)).toBe("8.90");
    expect(formatValue(metresToFeetInches(1.8).inches)).toBe("10.87");
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

describe("reading feet and inches typed by the user", () => {
  it("reads both fields into metres", () => {
    expect(feetInchesFromText("5", "9")).toBeCloseTo(1.7526, 9);
    expect(feetInchesFromText("5", "8,5")).toBeCloseTo(1.7399, 9);
  });

  it("treats an empty field as absent, so feet only or inches only is enough", () => {
    expect(feetInchesFromText("6", "")).toBeCloseTo(1.8288, 9);
    expect(feetInchesFromText("", "70")).toBeCloseTo(1.778, 9);
    expect(feetInchesFromText(" ", "70")).toBeCloseTo(1.778, 9);
  });

  it("accepts zero in one field when the other has a value", () => {
    expect(feetInchesFromText("0", "9")).toBeCloseTo(0.2286, 9);
    expect(feetInchesFromText("5", "0")).toBeCloseTo(1.524, 9);
  });

  it("gives no value when either field is malformed, even if the other is valid", () => {
    expect(feetInchesFromText("1.2.3", "9")).toBeNull();
    expect(feetInchesFromText("5", "abc")).toBeNull();
    expect(feetInchesFromText("5", ".")).toBeNull();
    expect(feetInchesFromText("-5", "9")).toBeNull();
  });

  it("gives no value when both fields are empty or the total is zero", () => {
    expect(feetInchesFromText("", "")).toBeNull();
    expect(feetInchesFromText("0", "")).toBeNull();
    expect(feetInchesFromText("0", "0")).toBeNull();
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

describe("formatting a signed difference", () => {
  it("shows a sign and two decimals, with a true minus sign", () => {
    expect(formatDifference(1.5)).toBe("+1.50");
    expect(formatDifference(-1.5625)).toBe("−1.56");
  });

  it("never shows ±0.00 for a real difference that rounds to zero", () => {
    expect(formatDifference(0.00486)).toBe("+<0.01");
    expect(formatDifference(-0.004)).toBe("−<0.01");
    expect(formatDifference(0.005)).toBe("+0.01");
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

describe("distance conversion", () => {
  it("converts miles to kilometres by the exact international mile", () => {
    expect(miToKm(1)).toBeCloseTo(1.609344, 12);
    expect(miToKm(26.2)).toBeCloseTo(42.1648128, 9);
  });

  it("converts kilometres to miles", () => {
    expect(kmToMi(10)).toBeCloseTo(6.2137119224, 9);
    expect(formatValue(kmToMi(10))).toBe("6.21");
    expect(formatValue(miToKm(1))).toBe("1.61");
  });
});
