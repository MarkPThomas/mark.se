import { IMemberBendingProps } from "../../../members/capacities/MemberBendingCapacity";
import { eCompactness } from "../../buckling/compactness/Compactness";
import { FlangeCompactnessFlexureMajor } from "../compactness/FlangeCompactness";
import { WebCompactnessFlexureMajor } from "../compactness/WebCompactness";
import { BendingLTB } from "./BendingLTB";
import {
  SectionBendingCapacity as BendingCapacityBase,
  ISectionBendingCapacity as IBendingCapacityBase,
  ISectionBendingCapacityProps as IBendingCapacityBaseProps
} from '../../capacities';

interface IBendingCapacityProps extends IBendingCapacityBaseProps {
  isWelded: boolean;
  k_c: number;

  E: number;
  G: number;
  F_L: number;

  I_minor: number;
  I_major: number;

  I_c_I_major: number

  r_min: number;

  r_t: number;
  r_ts: number;
  r_t_prime: number;

  c_compact: number;
  C_nonCompact: number;
  C_prime: number;

  C_w: number;
  J: number;

  a_w: number;
  h_o: number;
  t_w: number;

  web: WebCompactnessFlexureMajor;
  flange: FlangeCompactnessFlexureMajor;

  L_p: number;
  L_r: number;
}

export interface IBendingCapacity extends IBendingCapacityBase<IMemberBendingProps> {
  M_p_M_y: number;

  R_pc: number;
  R_pg: number;
  F_cr: number;

  M_n_CFY: number;
  M_n_CFLB: number;
  M_n_FLB: number; // Minor bending
}

export class BendingCapacity extends BendingCapacityBase<IBendingCapacityProps, IMemberBendingProps> implements IBendingCapacity {
  override LTB(memberProps: IMemberBendingProps): BendingLTB {
    const R_pg = this.R_pg;
    const M_n_CFLB = this.M_n_CFLB;
    return new BendingLTB({ ...memberProps, ...this._props, R_pg, M_n_CFLB });
  }

  private _M_p_M_y: number;
  get M_p_M_y(): number {
    if (this._M_p_M_y === undefined) {
      this._M_p_M_y = this.M_p_major / this.M_y_major;
    }

    return this._M_p_M_y
  }

  // Web plastification factor
  // AISC F4-9a, F4-9b, F4-10
  get R_pc(): number {
    if (this._R_pc === undefined) {
      this._R_pc = this.calc_R_pc();
    }
    return this._R_pc;
  }

  private _R_pc: number;
  private calc_R_pc(): number {
    const { I_c_I_major, web } = this._props;

    if (I_c_I_major <= 0.23) {
      return 1;

    } else if (web.isCompact()) {
      return this.M_p_M_y;

    } else if (web.isNonCompact()) {
      const M_p_M_y = this.M_p_M_y;
      return Math.min(M_p_M_y, M_p_M_y - (M_p_M_y - (M_p_M_y - 1) * web.lambdaRatio));
    }
  }

  // Bending strength reduction factor
  get R_pg(): number {
    if (this._R_pg === undefined) {
      this._R_pg = this.calc_R_pg();
    }
    return this._R_pg;
  }

  private _R_pg: number;
  private calc_R_pg(): number {
    const { a_w, h_o, t_w, E, F_y } = this._props;

    // TODO: h_c or h_o? CSI manual uses h_c in equation, but recerences h_o right after
    return Math.min(1, 1 - (a_w / (1200 + 300 * a_w)) * (h_o / t_w - 5.7 * Math.sqrt(E / F_y)));
  }

  // Flange Critical Buckling Stress
  // AISC F5-1, F5-8, F5-9
  get F_cr(): number {
    if (this._F_cr === undefined) {
      this._F_cr = this.calc_F_cr();
    }
    return this._F_cr;
  }

  private _F_cr: number;
  private calc_F_cr(): number {
    const { flange, F_y, E, k_c } = this._props;

    switch (flange.compactness()) {
      case eCompactness.compact:
        return F_y;

      case eCompactness.nonCompact:
        return F_y - 0.3 * F_y * flange.lambdaRatio;

      case eCompactness.slender:
        return Math.min(0.9 * E * k_c / flange.lambda ** 2, F_y);
    }
  }

  // AISC F6-4
  get F_crMinor(): number {
    if (this._F_crMinor === undefined) {
      this._F_crMinor = this.calc_F_crMinor();
    }
    return this._F_crMinor;
  }

  private _F_crMinor: number;
  private calc_F_crMinor(): number {
    const { flange, E } = this._props;

    return 0.69 * E / flange.lambda;
  }

  // AISC F2-1
  get M_y_major(): number {
    const { F_y, S_positive_major } = this._props;

    return F_y * S_positive_major;
  }

  // AISC F6-1
  get M_y_minor(): number {
    const { F_y, S_positive_minor } = this._props;

    return F_y * S_positive_minor;
  }

  // AISC F2-1
  get M_p_major(): number {
    const { F_y, Z_positive_major } = this._props;

    return F_y * Z_positive_major;
  }

  // AISC F6-1
  get M_p_minor(): number {
    const { F_y, Z_positive_minor } = this._props;

    return F_y * Z_positive_minor;
  }

  // Compression Flange Local Buckling
  // AISC F3-1, F3-2
  get M_n_CFLB(): number {
    if (this._M_n_CFLB === undefined) {
      this._M_n_CFLB = this.calc_M_n_CFLB();
    }
    return this._M_n_CFLB;
  }

  private _M_n_CFLB: number;
  private calc_M_n_CFLB(): number {
    const { web, F_y, F_L, S_positive_major } = this._props;


    // AISC F4-6a, F4.3
    // TODO: Check: F_L = 0.5 (min) for noncompact webs
    //                  = 0.7 (max) for compact webs, noncompact or less flange
    //                vs. eq. where those are limits with linear interpolation for
    const F_mod = web.isNonCompact() ? 0.5 : F_L; // 0.7;

    switch (web.compactness()) {
      case eCompactness.tooSlender:
        return null; // TODO: Notification of too slender?

      case eCompactness.slender:
        return this.R_pg * this.F_cr * S_positive_major;

      case eCompactness.nonCompact:
        // AISC F4-6a, F4.3
        const F_L_nc = 0.5 * F_y;
        // AISC F4-1, F4-13, F4-14
        return this.calc_M_n_CFLB_NonSlenderWeb(F_L_nc, this.M_n_CFY);

      case eCompactness.compact:
      default:
        const F_L_c = 0.7 * F_y;
        // AISC F3-1, F3-2
        return this.calc_M_n_CFLB_NonSlenderWeb(F_L_c, this.M_p_major);
    }
  }

  private calc_M_n_CFLB_NonSlenderWeb(F_L: number, M_p: number) {
    const { flange, k_c, E, S_positive_major } = this._props;
    if (flange.isCompact()) {
      return M_p;
    } else if (flange.isNonCompact()) {
      return M_p - (M_p - F_L * S_positive_major) * flange.lambdaRatio;
    } else {
      return 0.9 * k_c * E * S_positive_major / flange.lambda ** 2;
    }
  }

  // Flange Local Buckling (Minor Bending)
  // AISC F6-1, F6-2, F6-3
  get M_n_FLB(): number {
    if (this._M_n_FLB === undefined) {
      this._M_n_FLB = this.calc_M_n_FLB();
    }
    return this._M_n_FLB;
  }

  private _M_n_FLB: number;
  private calc_M_n_FLB(): number {
    const { flange, F_y, S_positive_minor } = this._props;

    switch (flange.compactness()) {
      case eCompactness.tooSlender:
        return null; // TODO: Notification of too slender?
      case eCompactness.slender:
        return this.F_crMinor * S_positive_minor;
      case eCompactness.nonCompact:
        return this.M_p_minor - (this.M_p_minor - 0.7 * F_y * S_positive_minor) * flange.lambdaRatio;
      case eCompactness.compact:
      default:
        return this.M_p_minor;
    }
  }

  // Compression Flange Yielding
  // AISC F4-1
  get M_n_CFY(): number {
    if (this._M_n_CFY === undefined) {
      this._M_n_CFY = this.calc_M_n_CFY();
    }
    return this._M_n_CFY;
  }

  private _M_n_CFY: number;
  private calc_M_n_CFY(): number {
    const { web } = this._props;

    switch (web.compactness()) {
      case eCompactness.tooSlender:
        return null; // TODO: Notification of too slender?
      case eCompactness.slender:
        return this.R_pg * this.M_y_major;
      case eCompactness.nonCompact:
        return this.R_pc * this.M_y_major;
      case eCompactness.compact:
      default:
        return this.M_p_major;
    }
  }


}