import { AxialBuckling, IAxialBuckling, IAxialBucklingProps } from "./AxialBuckling";

interface IAxialCapacityProps extends IAxialBucklingProps {
  A_effective(F_cr: number): number;
}

export interface IAxialCapacity extends IAxialBuckling {
  P_n_c_FB: number;

  F_e_FB: number;
  F_cr_compact_FB: number;
  F_cr_slender_FB: number;
}

export class AxialFB extends AxialBuckling<IAxialCapacityProps> implements IAxialCapacity {
  // AISC E3-4, E7
  get F_e_FB(): number {
    const { E, KL_r } = this._props;

    return Math.PI ** 2 * E / KL_r ** 2;
  }

  // AISC E3-2
  get F_cr_compact_FB() {
    if (this._F_cr_compact_FB === undefined) {
      this._F_cr_compact_FB = this.calc_F_cr_compact(this.F_e_FB);
    }

    return this._F_cr_compact_FB;
  }
  private _F_cr_compact_FB: number;

  // AISC E3-3
  get F_cr_slender_FB() {
    if (this._F_cr_slender_FB === undefined) {
      this._F_cr_slender_FB = this.calc_F_cr_slender(this.F_e_FB);
    }

    return this._F_cr_slender_FB;
  }
  private _F_cr_slender_FB: number;

  // AISC E3-1, E7-1
  get P_n_c_FB() {
    if (this._P_n_c_FB === undefined) {
      this._P_n_c_FB = this.calc_P_n_c_FB();
    }
    return this._P_n_c_FB;
  }
  private _P_n_c_FB: number;
  private calc_P_n_c_FB(): number {
    const { A_effective } = this._props;

    const F_e = this.F_e_FB;
    const F_cr_fb = this.calc_F_cr(F_e);
    const A_e_fb = A_effective(F_cr_fb);

    return F_cr_fb * A_e_fb;
  }
}