import { ElementCompactness } from "../../buckling/compactness/Compactness";
import {
  BendingLTB as BendingLTBBase,
  IBendingLTB as IBendingLTBBase,
  IBendingLTBProps as IBendingLTBBaseProps
} from '../../capacities';


// TODO: This class changes slightly based on the cross section.
//    Refactor BendingCapacity to handle that.
export interface IBendingLTBProps extends IBendingLTBBaseProps {
  // material
  E: number;
  G: number;
  F_y: number;

  // weld
  F_L: number;

  // section
  h_o: number;

  I_minor: number;
  I_major: number;

  r_min: number;
  r_t: number;
  r_ts: number;
  c_compact: number;
  C_nonCompact: number;
  C_w: number;
  J: number;
  S_positive_major: number;

  web: ElementCompactness;

  R_pg: number;
  M_n_CFLB: number;

  // member
  K_LTB: number;
  L_b_ratio: number;
  L_b_LTB: number;
  L_p: number;
  L_r: number;

  C_b: number;
  C_prime: number;
  r_t_prime: number;
}

export interface IBendingLTB extends IBendingLTBBase {
  F_cr_LTB: number;
  F_cr_compact_LTB: number;
  F_cr_nonCompact_LTB: number;
  F_cr_slender_LTB: number;
  F_cr_slenderWeb_LTB: number;

  isCompactLTB: boolean;
  isNonCompactLTB: boolean;
  isSlenderLTB: boolean;
}

export class BendingLTB extends BendingLTBBase<IBendingLTBProps> implements IBendingLTB {
  // AISC F2-1
  get isCompactLTB() {
    const { L_b_LTB, L_p } = this._props;

    return L_b_LTB <= L_p;
  }

  // AISC F2-2
  get isNonCompactLTB() {
    const { L_b_LTB, L_p, L_r } = this._props;

    return L_p <= L_b_LTB && L_b_LTB <= L_r;
  }

  // AISC F2-3
  get isSlenderLTB() {
    const { L_b_LTB, L_r } = this._props;

    return L_r < L_b_LTB
  }

  // AISC F2-1, F2-2, F2-3
  get M_n_LTB() {
    if (this._M_n_LTB === undefined) {
      this._M_n_LTB = this.calc_M_n_LTB();
    }
    return this._M_n_LTB;
  }
  private _M_n_LTB: number;
  private calc_M_n_LTB(): number {
    const { F_y, F_L, S_positive_major: S_major, web, C_b, L_b_ratio, R_pg, M_n_CFLB } = this._props;

    if (web.isSlender()) {
      return R_pg * this.F_cr_slenderWeb_LTB * S_major;
    } else if (this.isCompactLTB) {
      return M_n_CFLB;
    } else if (this.isNonCompactLTB) {
      return Math.min(M_n_CFLB, C_b * (M_n_CFLB - (M_n_CFLB - F_L * F_y * S_major) * L_b_ratio));
    } else {
      return Math.min(M_n_CFLB, this.calc_F_cr_LTB() * S_major);
    }
  }

  // AISC F2-4, F5-1, F5-3, F5-4
  get F_cr_LTB(): number {
    if (this._F_cr_LTB === undefined) {
      this._F_cr_LTB = this.calc_F_cr_LTB();
    }
    return this._F_cr_LTB;
  }
  private _F_cr_LTB: number;
  private calc_F_cr_LTB() {
    const { web, C_b, E, L_b_LTB, r_t_prime, J, C_prime: c_prime, S_positive_major: S_major, h_o } = this._props;

    return (web.isSlender())
      ? this.calc_F_cr_slenderWeb()
      : (C_b * Math.PI ** 2 * E / (L_b_LTB / r_t_prime) ** 2)
      * Math.sqrt(1 + 0.078 * (J * c_prime / (S_major * h_o)) * (L_b_LTB / r_t_prime) ** 2);
  }

  // AISC F5-1, F5-3, F5-4
  get F_cr_slenderWeb_LTB(): number {
    if (this._F_cr_slenderWeb_LTB === undefined) {
      this._F_cr_slenderWeb_LTB = this.calc_F_cr_slenderWeb();
    }
    return this._F_cr_slenderWeb_LTB;
  }
  private _F_cr_slenderWeb_LTB: number;
  private calc_F_cr_slenderWeb() {
    if (this.isCompactLTB) {
      return this.F_cr_compact_LTB;
    } else if (this.isNonCompactLTB) {
      return this.F_cr_nonCompact_LTB;
    } else {
      return this.F_cr_slender_LTB;
    }
  }

  // AISC F5-1
  get F_cr_compact_LTB(): number {
    if (this._F_cr_compact_LTB === undefined) {
      this._F_cr_compact_LTB = this.calc_F_cr_compact_LTB();
    }
    return this._F_cr_compact_LTB;
  }
  private _F_cr_compact_LTB: number;
  private calc_F_cr_compact_LTB() {
    const { F_y } = this._props;

    return F_y;
  }

  // AISC F5-3
  get F_cr_nonCompact_LTB(): number {
    if (this._F_cr_nonCompact_LTB === undefined) {
      this._F_cr_nonCompact_LTB = this.calc_F_cr_nonCompact_LTB();
    }
    return this._F_cr_nonCompact_LTB;
  }
  private _F_cr_nonCompact_LTB: number;
  private calc_F_cr_nonCompact_LTB() {
    const { F_y, C_b, L_b_ratio } = this._props;

    return Math.min(F_y, C_b * (F_y - 0.3 * F_y * L_b_ratio));
  }

  // AISC F5-4
  get F_cr_slender_LTB(): number {
    if (this._F_cr_slender_LTB === undefined) {
      this._F_cr_slender_LTB = this.calc_F_cr_slender_LTB();
    }
    return this._F_cr_slender_LTB;
  }
  private _F_cr_slender_LTB: number;
  private calc_F_cr_slender_LTB() {
    const { E, F_y, C_b, r_t, L_b_LTB } = this._props;

    return Math.min(F_y, C_b * Math.PI ** 2 * E / (L_b_LTB / r_t) ** 2);
  }
}