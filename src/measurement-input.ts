import { parseMeasurement } from "./conversions";

const DISALLOWED = /[^\d.,]/g;

/**
 * Drops characters a measurement can't contain (minus signs, letters, ...)
 * as they are typed, keeping the caret where the user expects it.
 */
function rejectDisallowedCharacters(input: HTMLInputElement): void {
  const typed = input.value;
  const cleaned = typed.replace(DISALLOWED, "");
  if (cleaned === typed) return;
  const beforeCaret = typed.slice(0, input.selectionStart ?? typed.length);
  const newCaret = beforeCaret.replace(DISALLOWED, "").length;
  input.value = cleaned;
  input.setSelectionRange(newCaret, newCaret);
}

/**
 * One side of a converter card, e.g. "kg", "lb" or "ft + in". Every side
 * converts to and from one shared unit per card (kg for weight, m for height).
 */
export interface MeasurementSide {
  inputs: HTMLInputElement[];
  /** Reads the inputs' text (in input order) as a value in the shared unit, or null for no usable value. */
  read(texts: string[]): number | null;
  /** Display strings for a shared-unit value, one per input, in input order. */
  show(value: number): string[];
}

/** A side with a single input whose unit converts to/from the shared unit. */
export function singleInputSide(
  input: HTMLInputElement,
  toShared: (value: number) => number,
  fromShared: (value: number) => string,
): MeasurementSide {
  return {
    inputs: [input],
    read: ([text]) => {
      const value = parseMeasurement(text ?? "");
      return value === null ? null : toShared(value);
    },
    show: (value) => [fromShared(value)],
  };
}

/**
 * Links two sides so that typing in any input live-updates the other side.
 * Inputs on the side being edited are never rewritten; the other side shows
 * the converted value, or blanks when the typed values aren't usable.
 */
export function linkMeasurementSides(a: MeasurementSide, b: MeasurementSide): void {
  const link = (source: MeasurementSide, target: MeasurementSide) => {
    for (const input of source.inputs) {
      input.addEventListener("input", () => {
        rejectDisallowedCharacters(input);
        const value = source.read(source.inputs.map((field) => field.value));
        const shown = value === null ? [] : target.show(value);
        target.inputs.forEach((field, index) => {
          field.value = shown[index] ?? "";
        });
      });
    }
  };
  link(a, b);
  link(b, a);
}
