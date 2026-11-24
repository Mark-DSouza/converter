import { bmiCard } from "./bmi-card";
import {
  feetInchesFromText,
  formatValue,
  kgToLb,
  kmToMi,
  lbToKg,
  metresToFeetInches,
  miToKm,
} from "./conversions";
import { requireElement } from "./dom";
import { linkMeasurementSides, singleInputSide } from "./measurement-input";

const input = (id: string) => requireElement(document, `#${id}`, HTMLInputElement);
const same = (value: number) => value;

// BMI card: fed by the Weight and Height cards' shared values.
const bmi = bmiCard(requireElement(document, "#bmi-card", HTMLElement));

// Weight card: shared unit kg.
linkMeasurementSides(
  singleInputSide(input("weight-kg"), same, formatValue),
  singleInputSide(input("weight-lb"), lbToKg, (kg) => formatValue(kgToLb(kg))),
  bmi.setWeight,
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
  bmi.setHeight,
);

// Distance card: shared unit km. Feeds no other card.
linkMeasurementSides(
  singleInputSide(input("distance-km"), same, formatValue),
  singleInputSide(input("distance-mi"), miToKm, (km) => formatValue(kmToMi(km))),
  () => {},
);
