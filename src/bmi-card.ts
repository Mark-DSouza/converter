import { bmiReport, formatDifference, formatValue, kgToLb, type BmiTarget } from "./conversions";
import { requireElement } from "./dom";

export interface BmiCard {
  /** Current weight in kg, or null when the Weight card has no usable value. */
  setWeight(kg: number | null): void;
  /** Current height in m, or null when the Height card has no usable value. */
  setHeight(metres: number | null): void;
}

type Direction = "down" | "up";
const ARROWS: Record<Direction, string> = { down: "↓", up: "↑" };

/** A run of text that never wraps across lines (e.g. "70.44 kg / 155.29 lb"). */
function unbroken(text: string): HTMLSpanElement {
  const span = document.createElement("span");
  span.className = "nowrap";
  span.textContent = text;
  return span;
}

/** The arrow is decorative: the output's label already says down or up. */
function arrow(direction: Direction): HTMLSpanElement {
  const span = document.createElement("span");
  span.setAttribute("aria-hidden", "true");
  span.textContent = ARROWS[direction];
  return span;
}

const kgAndLb = (kg: number) => unbroken(`${formatValue(kg)} kg / ${formatValue(kgToLb(kg))} lb`);

/** "1 BMI point = 3.06 kg / 6.75 lb at your height" */
function perPointLine(kgPerPoint: number): (Node | string)[] {
  return ["1 BMI point = ", kgAndLb(kgPerPoint), " at your height"];
}

/** "↓ BMI 23.00 at 70.44 kg / 155.29 lb (−1.56 kg)" */
function targetLine(direction: Direction, target: BmiTarget): (Node | string)[] {
  return [
    arrow(direction),
    ` BMI ${formatValue(target.bmi)} at `,
    kgAndLb(target.weightKg),
    " ",
    unbroken(`(${formatDifference(target.differenceKg)} kg)`),
  ];
}

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
    perPoint.replaceChildren(...(report ? perPointLine(report.kgPerPoint) : []));
    down.replaceChildren(...(report?.down ? targetLine("down", report.down) : []));
    down.hidden = !report?.down;
    up.replaceChildren(...(report ? targetLine("up", report.up) : []));
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
