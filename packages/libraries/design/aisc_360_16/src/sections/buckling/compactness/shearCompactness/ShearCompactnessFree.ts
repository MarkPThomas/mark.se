import { ShearCompactness } from "./ShearCompactness";

// AISC G2, G6
export class ShearCompactnessFree extends ShearCompactness {
  // AISC G6
  override readonly k_v: number = 1.2;

  // AISC G2-9, G2-10, G2-11
  override slenderLimit(): number {
    return 1.37 * Math.sqrt(this.k_v * this.E / this.F_y);
  }
}