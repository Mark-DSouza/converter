/** Exact by definition (international avoirdupois pound, 1959). */
const KG_PER_LB = 0.45359237;

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

/** Exact by definition (international mile, 1959). */
const KM_PER_MI = 1.609344;

export function kmToMi(km: number): number {
  return km / KM_PER_MI;
}

export function miToKm(mi: number): number {
  return mi * KM_PER_MI;
}

/** Exact by definition (international inch, 1959). */
const METRES_PER_INCH = 0.0254;
const INCHES_PER_FOOT = 12;

export interface FeetInches {
  /** Whole feet. */
  feet: number;
  /** Remaining inches, 0 ≤ inches < 12. */
  inches: number;
}

/**
 * Splits a height into whole feet and remaining inches. The split happens at
 * display precision (hundredths of an inch), so a value just under a whole
 * foot reads 6 ft 0.00 in rather than 5 ft 12.00 in.
 */
export function metresToFeetInches(metres: number): FeetInches {
  const totalInches = roundToHundredths(metres / METRES_PER_INCH);
  const feet = Math.floor(totalInches / INCHES_PER_FOOT);
  return { feet, inches: roundToHundredths(totalInches - feet * INCHES_PER_FOOT) };
}

/** Inches of 12 or more simply add up (5 ft 14 in = 6 ft 2 in). */
export function feetInchesToMetres(feet: number, inches: number): number {
  return (feet * INCHES_PER_FOOT + inches) * METRES_PER_INCH;
}

const MEASUREMENT_PATTERN = /^(\d+\.?\d*|\.\d+)$/;

/** A non-negative number typed by the user, or null if the text isn't one. */
function readNumber(text: string): number | null {
  const normalised = text.trim().replace(",", ".");
  return MEASUREMENT_PATTERN.test(normalised) ? Number(normalised) : null;
}

/**
 * Reads a value typed into a measurement field. Returns null for anything
 * that isn't a positive number (empty, zero, negative, non-numeric), which
 * the UI shows as a blank result. A comma is accepted as decimal separator.
 */
export function parseMeasurement(text: string): number | null {
  const value = readNumber(text);
  return value !== null && value > 0 ? value : null;
}

/**
 * Reads the feet and inches fields into metres. An empty field counts as
 * absent, so feet only or inches only is enough, and zero is fine in one
 * field. A malformed field, both fields empty, or a zero total give null.
 */
export function feetInchesFromText(feetText: string, inchesText: string): number | null {
  const field = (text: string) => (text.trim() === "" ? 0 : readNumber(text));
  const feet = field(feetText);
  const inches = field(inchesText);
  if (feet === null || inches === null) return null;
  const metres = feetInchesToMetres(feet, inches);
  return metres > 0 ? metres : null;
}

/**
 * Rounds half up to two decimals. 1.005 is stored as 1.00499999..., so the
 * scaled value is trimmed to 15 significant digits to remove that binary
 * noise before rounding.
 */
function roundToHundredths(value: number): number {
  return Math.round(Number((value * 100).toPrecision(15))) / 100;
}

/** Display rule for every value in the app: exactly two decimal places. */
export function formatValue(value: number): string {
  return roundToHundredths(value).toFixed(2);
}

/**
 * A signed difference to 2 dp with a true minus sign ("+1.50", "−1.56").
 * A real difference too small to show reads "+<0.01" / "−<0.01", never ±0.00.
 */
export function formatDifference(value: number): string {
  const sign = value < 0 ? "−" : "+";
  const magnitude = roundToHundredths(Math.abs(value));
  return magnitude === 0 && value !== 0 ? `${sign}<0.01` : `${sign}${magnitude.toFixed(2)}`;
}

/** A classification table: each category starts at its (inclusive) lower bound, ascending. */
type Classification<Category extends string> = readonly (readonly [lowerBound: number, category: Category])[];

const WHO = [
  [0, "Underweight"],
  [18.5, "Normal"],
  [25, "Overweight"],
  [30, "Obese I"],
  [35, "Obese II"],
  [40, "Obese III"],
] as const satisfies Classification<string>;

export type WhoCategory = (typeof WHO)[number][1];

/** WHO expert consultation (2004) cut-offs for Asian populations. */
const ASIAN = [
  [0, "Underweight"],
  [18.5, "Normal"],
  [23, "Overweight"],
  [25, "Obese I"],
  [30, "Obese II"],
] as const satisfies Classification<string>;

export type AsianCategory = (typeof ASIAN)[number][1];

function classify<Category extends string>(bmi: number, table: Classification<Category>): Category {
  let category = table[0]![1];
  for (const [lowerBound, name] of table) {
    if (bmi >= lowerBound) category = name;
  }
  return category;
}

/** The weight at which BMI would reach a given whole number, at the same height. */
export interface BmiTarget {
  /** Whole-number BMI. */
  bmi: number;
  weightKg: number;
  /** Target weight minus current weight: negative to lose, positive to gain. */
  differenceKg: number;
}

export interface BmiReport {
  /** Body mass index at full precision (kg/m²). */
  bmi: number;
  who: WhoCategory;
  asian: AsianCategory;
  /** Weight in kg that one BMI point represents at this height (= height²). */
  kgPerPoint: number;
  /** The next whole BMI below the current one, or null when that would be below BMI 1. */
  down: BmiTarget | null;
  /** The next whole BMI above the current one. */
  up: BmiTarget;
}

/**
 * BMI, both classifications, kg per BMI point and the next whole-BMI
 * targets. Categories and targets both use the BMI as displayed (2 dp), so a
 * value shown as 25.00 never reads Normal and targets 24 and 26.
 */
export function bmiReport({ heightM, weightKg }: { heightM: number; weightKg: number }): BmiReport {
  const kgPerPoint = heightM * heightM;
  const bmi = weightKg / kgPerPoint;
  const shown = roundToHundredths(bmi);
  const downBmi = Math.ceil(shown) - 1;
  const target = (wholeBmi: number): BmiTarget => {
    const targetKg = wholeBmi * kgPerPoint;
    return { bmi: wholeBmi, weightKg: targetKg, differenceKg: targetKg - weightKg };
  };
  return {
    bmi,
    who: classify(shown, WHO),
    asian: classify(shown, ASIAN),
    kgPerPoint,
    // Strictly below / above the displayed BMI: 24.00 targets 23 and 25.
    down: downBmi >= 1 ? target(downBmi) : null,
    up: target(Math.floor(shown) + 1),
  };
}
