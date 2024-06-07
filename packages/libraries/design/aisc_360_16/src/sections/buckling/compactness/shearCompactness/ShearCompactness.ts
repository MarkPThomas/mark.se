import { ElementCompactness } from "../ElementCompactness";

// AISC G2, G6
export abstract class ShearCompactness extends ElementCompactness {
  // AISC G6
  readonly k_v: number;

  // AISC G2-9, G2-10, G2-11
  override nonCompactLimit(): number {
    return 1.1 * Math.sqrt(this.k_v * this.E / this.F_y);
  }
}