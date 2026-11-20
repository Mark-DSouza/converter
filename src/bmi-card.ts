import { bmiReport, formatValue, kgToLb, type BmiTarget } from "./conversions";
import { requireElement } from "./dom";

export interface BmiCard {
  /** Current weight in kg, or null when the Weight card has no usable value. */
  setWeight(kg: number | null): void;
  /** Current height in m, or null when the Height card has no usable value. */
  setHeight(metres: number | null): void;
}

/** "3.06 kg / 6.75 lb" */
const kgAndLb = (kg: number) => `${formatValue(kg)} kg / ${formatValue(kgToLb(kg))} lb`;

/** "+1.50 kg" or "−1.56 kg" (true minus sign). */
const signedKg = (kg: number) => `${kg < 0 ? "−" : "+"}${formatValue(Math.abs(kg))} kg`;

const targetLine = (arrow: string, target: BmiTarget) =>
  `${arrow} BMI ${formatValue(target.bmi)} at ${kgAndLb(target.weightKg)} (${signedKg(target.differenceKg)})`;

/** The output-only BMI card. It shows a prompt until both weight and height are known. */
export function bmiCard(card: HTMLElement): BmiCard {
  const hint = requireElement(card, "[data-bmi-hint]", HTMLParagraphElement);
  const result = requireElement(card, "[data-bmi-result]", HTMLDivElement);
  const value = requireElement(card, "[data-bmi-value]", HTMLOutputElement);
  const who = requireElement(card, "[data-bmi-who]", HTMLOutputElement);
  const asian = requireElement(card, "[data-bmi-asian]", HTMLOutputElement);
  const perPoint = requireElement(card, "[data-bmi-per-point]", HTMLOutputElement);
  const down = requireElement(card, "[data-bmi-down]", HTMLOutputElement);
  const up = requireElement(card, "[data-bmi-up]", HTMLOutputElement);

  let weightKg: number | null = null;
  let heightM: number | null = null;

  const render = () => {
    const report = heightM === null || weightKg === null ? null : bmiReport({ heightM, weightKg });
    hint.hidden = report !== null;
    result.hidden = report === null;
    value.value = report ? formatValue(report.bmi) : "";
    who.value = report?.who ?? "";
    asian.value = report?.asian ?? "";
    perPoint.value = report ? `1 BMI point = ${kgAndLb(report.kgPerPoint)} at your height` : "";
    down.value = report ? targetLine("↓", report.down) : "";
    up.value = report ? targetLine("↑", report.up) : "";
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
