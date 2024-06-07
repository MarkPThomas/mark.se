import { phi_v } from "../../../materials/MaterialFactors";
import { ISectionShearCapacityConfinedWeb, SectionShearCapacityConfinedWeb } from "../../capacities/SectionShearCapacityConfinedWeb";

export interface IShearCapacity extends ISectionShearCapacityConfinedWeb {
  phi_v_web: number;
}

export class ShearCapacity extends SectionShearCapacityConfinedWeb implements IShearCapacity {
  // AISC G2.1a
  // I only
  get phi_v_web() {
    return this.isWebRolledAndCompactInShear() ? 1 : phi_v;
  }

  override get phiV_n_major() {
    return this.phi_v_web * this.V_n_major;
  }
}