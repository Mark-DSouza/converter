import { feetInchesToMetres, formatValue, kgToLb, lbToKg, metresToFeetInches } from "./conversions";
import { linkMeasurementSides, singleInputSide } from "./measurement-input";

function input(id: string): HTMLInputElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLInputElement)) throw new Error(`Missing input #${id}`);
  return element;
}

const same = (value: number) => value;

// Weight card: shared unit kg.
linkMeasurementSides(
  singleInputSide(input("weight-kg"), same, formatValue),
  singleInputSide(input("weight-lb"), lbToKg, (kg) => formatValue(kgToLb(kg))),
);

// Height card: shared unit m. Feet only or inches only is enough.
linkMeasurementSides(singleInputSide(input("height-m"), same, formatValue), {
  inputs: [input("height-ft"), input("height-in")],
  read: ([feet, inches]) => (feet == null && inches == null ? null : feetInchesToMetres(feet ?? 0, inches ?? 0)),
  show: (metres) => {
    const { feet, inches } = metresToFeetInches(metres);
    return [String(feet), formatValue(inches)];
  },
});
