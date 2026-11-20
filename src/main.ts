import { bmiCard } from "./bmi-card";
import { feetInchesFromText, formatValue, kgToLb, lbToKg, metresToFeetInches } from "./conversions";
import { linkMeasurementSides, singleInputSide } from "./measurement-input";

function byId<T extends HTMLElement>(id: string, type: new () => T): T {
  const element = document.getElementById(id);
  if (!(element instanceof type)) throw new Error(`Missing #${id}`);
  return element;
}
const input = (id: string) => byId(id, HTMLInputElement);

const same = (value: number) => value;

// BMI card: fed by the Weight and Height cards' shared values.
const showBmi = bmiCard(byId("bmi-card", HTMLElement));
let weightKg: number | null = null;
let heightM: number | null = null;

// Weight card: shared unit kg.
linkMeasurementSides(
  singleInputSide(input("weight-kg"), same, formatValue),
  singleInputSide(input("weight-lb"), lbToKg, (kg) => formatValue(kgToLb(kg))),
  (kg) => {
    weightKg = kg;
    showBmi(heightM, weightKg);
  },
);

// Height card: shared unit m.
linkMeasurementSides(
  singleInputSide(input("height-m"), same, formatValue),
  {
    inputs: [input("height-ft"), input("height-in")],
    read: ([feet, inches]) => feetInchesFromText(feet ?? "", inches ?? ""),
    show: (metres) => {
      const { feet, inches } = metresToFeetInches(metres);
      return [String(feet), formatValue(inches)];
    },
  },
  (metres) => {
    heightM = metres;
    showBmi(heightM, weightKg);
  },
);
