import { ShearCompactnessConfined } from "./ShearCompactnessConfined";

// AISC G2
export class ShearCompactnessConfinedInterior extends ShearCompactnessConfined {
  // AISC G2.1(b)(2)(i)
  override readonly k_v: number = 5.34;
}