import { ShearCompactness } from "./ShearCompactness";

// AISC G2
export abstract class ShearCompactnessConfined extends ShearCompactness {
  // AISC G2-1a
  compactLimit(): number {
    return 2.24 * Math.sqrt(this.E / this.F_y);
  }
}