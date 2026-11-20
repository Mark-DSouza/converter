import { kgToLb, lbToKg } from "./conversions";
import { linkMeasurementPair } from "./measurement-input";

function input(id: string): HTMLInputElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLInputElement)) throw new Error(`Missing input #${id}`);
  return element;
}

linkMeasurementPair(input("weight-kg"), input("weight-lb"), kgToLb, lbToKg);
