import { formatValue, parseMeasurement } from "./conversions";

const DISALLOWED = /[^\d.,]/g;

/**
 * Drops characters a measurement can't contain (minus signs, letters, ...)
 * as they are typed, keeping the caret where the user expects it.
 */
function rejectDisallowedCharacters(input: HTMLInputElement): void {
  const typed = input.value;
  const cleaned = typed.replace(DISALLOWED, "");
  if (cleaned === typed) return;
  const caret = input.selectionStart ?? typed.length;
  const removedBeforeCaret = typed.slice(0, caret).length - typed.slice(0, caret).replace(DISALLOWED, "").length;
  input.value = cleaned;
  const newCaret = caret - removedBeforeCaret;
  input.setSelectionRange(newCaret, newCaret);
}

/**
 * Links two measurement inputs so that typing in either one live-updates the
 * other. The field being edited is never reformatted; the partner shows the
 * converted value to 2 dp, or blank when the typed value isn't usable.
 */
export function linkMeasurementPair(
  a: HTMLInputElement,
  b: HTMLInputElement,
  aToB: (value: number) => number,
  bToA: (value: number) => number,
): void {
  const link = (source: HTMLInputElement, target: HTMLInputElement, convert: (value: number) => number) => {
    source.addEventListener("input", () => {
      rejectDisallowedCharacters(source);
      const value = parseMeasurement(source.value);
      target.value = value === null ? "" : formatValue(convert(value));
    });
  };
  link(a, b, aToB);
  link(b, a, bToA);
}
