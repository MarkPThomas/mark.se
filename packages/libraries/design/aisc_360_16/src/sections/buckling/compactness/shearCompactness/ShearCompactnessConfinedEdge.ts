import { ShearCompactnessConfined } from "./ShearCompactnessConfined";

// AISC G2
export class ShearCompactnessConfinedEdge extends ShearCompactnessConfined {
  // AISC G4
  override readonly k_v: number = 5;
}