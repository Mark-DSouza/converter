import { bmiReport, formatValue } from "./conversions";
import { requireElement } from "./dom";

export interface BmiCard {
  /** Current weight in kg, or null when the Weight card has no usable value. */
  setWeight(kg: number | null): void;
  /** Current height in m, or null when the Height card has no usable value. */
  setHeight(metres: number | null): void;
}

/** The output-only BMI card. It shows a prompt until both weight and height are known. */
export function bmiCard(card: HTMLElement): BmiCard {
  const hint = requireElement(card, "[data-bmi-hint]", HTMLParagraphElement);
  const result = requireElement(card, "[data-bmi-result]", HTMLDListElement);
  const value = requireElement(card, "[data-bmi-value]", HTMLOutputElement);
  const who = requireElement(card, "[data-bmi-who]", HTMLOutputElement);
  const asian = requireElement(card, "[data-bmi-asian]", HTMLOutputElement);

  let weightKg: number | null = null;
  let heightM: number | null = null;

  const render = () => {
    const report = heightM === null || weightKg === null ? null : bmiReport({ heightM, weightKg });
    hint.hidden = report !== null;
    result.hidden = report === null;
    value.value = report ? formatValue(report.bmi) : "";
    who.value = report?.who ?? "";
    asian.value = report?.asian ?? "";
  };

  return {
    setWeight(kg) {
      weightKg = kg;
      render();
    },
    setHeight(metres) {
      heightM = metres;
      render();
    },
  };
}
