import { AxialBuckling, IAxialBuckling, IAxialBucklingProps } from "./AxialBuckling";

interface IAxialLTBProps extends IAxialBucklingProps {
  // material
  G: number;
  F_u: number;

  // section
  A_g: number;
  A_effective(F_cr: number): number;
  C_w: number;
  J: number;
  I_minor: number;
  I_major: number;

  // member
  L_cr_LTB: number;
  F_e_LTB: number;
}

export interface IAxialLTB extends IAxialBuckling {
  P_n_c_LTB: number;

  F_e_LTB: number;
  F_cr_compact_LTB: number;
  F_cr_slender_LTB: number;
}

export class AxialLTB extends AxialBuckling<IAxialLTBProps> implements IAxialLTB {
  // AISC E4-2, E7
  get F_e_LTB(): number {
    const { E, C_w, L_cr_LTB, G, J, I_major, I_minor } = this._props;

    // TODO: Note, these seem to be able to be grouped by shape type, specific to shape type.
    // Cross Section dependency
    // In order to keep this shape-agnotistic, this could be placed in a separate class & injected here.
    return (Math.PI ** 2 * E * C_w / L_cr_LTB ** 2 + G * J) / (I_minor + I_major);
  }

  // AISC E3-2?
  get F_cr_compact_LTB() {
    if (this._F_cr_compact_LTB === undefined) {
      this._F_cr_compact_LTB = this.calc_F_cr_compact(this.F_e_LTB);
    }

    return this._F_cr_compact_LTB;
  }
  private _F_cr_compact_LTB: number;

  // AISC E3-3 ?
  get F_cr_slender_LTB() {
    if (this._F_cr_slender_LTB === undefined) {
      this._F_cr_slender_LTB = this.calc_F_cr_slender(this.F_e_LTB);
    }

    return this._F_cr_slender_LTB;
  }
  private _F_cr_slender_LTB: number;

  // AISC E4-1, E7-1
  get P_n_c_LTB() {
    if (this._P_n_c_LTB === undefined) {
      this._P_n_c_LTB = this.calc_P_n_c_LTB();
    }
    return this._P_n_c_LTB;
  }
  private _P_n_c_LTB: number;
  private calc_P_n_c_LTB(): number {
    const { A_effective, } = this._props;

    const F_e = this.F_e_LTB;
    const F_cr_LTB = this.calc_F_cr(F_e);
    const A_e_LTB = A_effective(F_cr_LTB);

    return F_cr_LTB * A_e_LTB;
  }
}