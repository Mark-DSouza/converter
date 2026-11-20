import { bmiReport } from "./bmi";
import { formatValue } from "./conversions";

function element<T extends HTMLElement>(root: ParentNode, selector: string, type: new () => T): T {
  const found = root.querySelector(selector);
  if (!(found instanceof type)) throw new Error(`Missing ${selector}`);
  return found;
}

/**
 * The output-only BMI card. Call the returned function with the current
 * height (m) and weight (kg); either being null shows the blank state.
 */
export function bmiCard(card: HTMLElement): (heightM: number | null, weightKg: number | null) => void {
  const hint = element(card, "[data-bmi-hint]", HTMLParagraphElement);
  const result = element(card, "[data-bmi-result]", HTMLDListElement);
  const value = element(card, "[data-bmi-value]", HTMLOutputElement);
  const who = element(card, "[data-bmi-who]", HTMLOutputElement);
  const asian = element(card, "[data-bmi-asian]", HTMLOutputElement);

  return (heightM, weightKg) => {
    const report = heightM === null || weightKg === null ? null : bmiReport(heightM, weightKg);
    hint.hidden = report !== null;
    result.hidden = report === null;
    value.value = report ? formatValue(report.bmi) : "";
    who.value = report?.who ?? "";
    asian.value = report?.asian ?? "";
  };
}
