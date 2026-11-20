import { roundToHundredths } from "./conversions";

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

export interface BmiReport {
  /** Body mass index at full precision (kg/m²). */
  bmi: number;
  who: WhoCategory;
  asian: AsianCategory;
}

export function bmiReport(heightM: number, weightKg: number): BmiReport {
  const bmi = weightKg / (heightM * heightM);
  // Classify the value as displayed, so "25.00" never reads Normal.
  const shown = roundToHundredths(bmi);
  return { bmi, who: classify(shown, WHO), asian: classify(shown, ASIAN) };
}
