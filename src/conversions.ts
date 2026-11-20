/** Exact by definition (international avoirdupois pound, 1959). */
const KG_PER_LB = 0.45359237;

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
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

const MEASUREMENT = /^(\d+\.?\d*|\.\d+)$/;

/**
 * Reads a value typed into a measurement field. Returns null for anything
 * that isn't a positive number (empty, zero, negative, non-numeric), which
 * the UI shows as a blank result. A comma is accepted as decimal separator.
 */
export function parseMeasurement(text: string): number | null {
  const normalised = text.trim().replace(",", ".");
  if (!MEASUREMENT.test(normalised)) return null;
  const value = Number(normalised);
  return value > 0 ? value : null;
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
