/** Exact by definition (international avoirdupois pound, 1959). */
const KG_PER_LB = 0.45359237;

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
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

/** Display rule for every value in the app: exactly two decimal places. */
export function formatValue(value: number): string {
  // 1.005 is stored as 1.00499999..., so plain toFixed(2) would give "1.00".
  // Trimming the scaled value to 15 significant digits removes that binary
  // noise before rounding half up.
  const hundredths = Number((value * 100).toPrecision(15));
  return (Math.round(hundredths) / 100).toFixed(2);
}
