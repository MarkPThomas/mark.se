import { phi_v } from "../../materials/MaterialFactors";
import { eCompactness, ShearCompactness } from "../buckling/compactness";

export interface ISectionShearCapacityProps {
  E: number;
  F_y: number;
  F_u: number;

  A_v_major: number;
  A_v_minor: number;

  web: ShearCompactness;  // shearMajor
  flange: ShearCompactness;  // shearMinor
}

export interface ISectionShearCapacity {
  C_v2: number;
  V_n_major: number;
  V_n_minor: number;
  phiV_n_major: number;
  phiV_n_minor: number;
}

export class SectionShearCapacity<T extends ISectionShearCapacityProps = ISectionShearCapacityProps>
  implements ISectionShearCapacity {

  protected _props: T;

  constructor(props: T) {
    this._props = props;
  }

  // AISC G2-1
  get V_n_major() {
    const { F_y, A_v_major } = this._props;

    return 0.6 * F_y * A_v_major * this.C_v2;
  }

  get phiV_n_major() {
    return phi_v * this.V_n_major;
  }

  // AISC G2-9, G2-10, G2-11
  // I, C, CC minors
  // T, L, LL majors/minors
  // where k_v = 1.2
  // Rectangular HSS &  box, where k_v = 5 (what is flange.k_v? & the compactness limits?)
  // Therefore this can be used for all sections, where what differs is in the flange compactness
  // Section-specific can inherit to specify V_n_major/minor for C_v1 vs. C_v2
  // Also, phi_v_web is specific to I sections
  get C_v2() {
    const { flange, E, F_y } = this._props;

    switch (flange.compactness()) {
      case eCompactness.compact:
        return 1;
      case eCompactness.nonCompact:
        return flange.nonCompactLimit() / flange.lambda;
      case eCompactness.slender:
        return 1.51 * E * flange.k_v / (F_y * flange.lambda ** 2);
    }
  }

  // AISC G6-1
  get V_n_minor() {
    const { F_y, A_v_minor } = this._props;

    return 0.6 * F_y * A_v_minor * this.C_v2;
  }

  get phiV_n_minor() {
    return phi_v * this.V_n_major;
  }
}