import { AxialFB } from "./AxialFB";
import { AxialLTB } from "./AxialLTB";

export interface IMemberAxialCapacityProps {
  hasCompressionLTB: boolean;

  // material
  E: number;
  G: number;
  F_y: number;
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
  KL_r: number;

  F_e_LTB: number;
}

export interface IMemberAxialCapacity {
  lambda_fb: number;

  FlexuralBuckling: AxialFB;
  LateralTorsionalBucking: AxialLTB;

  P_n_c: number;
}

export class MemberAxialCapacity implements IMemberAxialCapacity {
  private E: number;
  private F_y: number;
  private hasCompressionLTB: boolean;

  private _flexuralBuckling: AxialFB;
  get FlexuralBuckling(): AxialFB {
    return this._flexuralBuckling;
  }

  private _lateralTorsionalBucking: AxialLTB;
  get LateralTorsionalBucking(): AxialLTB {
    return this._lateralTorsionalBucking;
  }

  constructor(props: IMemberAxialCapacityProps) {
    const lambda_fb = this.lambda_fb;
    this._flexuralBuckling = new AxialFB({ ...props, lambda_fb });

    if (this.hasCompressionLTB) {
      this._lateralTorsionalBucking = new AxialLTB({ ...props, lambda_fb });
    }
  }

  // slenderness limit
  // AISC E3-2, E3-3
  get lambda_fb(): number {
    return 4.71 * Math.sqrt(this.E / this.F_y);
  }

  get P_n_c() {
    if (this._flexuralBuckling && this._lateralTorsionalBucking) {
      return Math.min(this._flexuralBuckling.P_n_c_FB, this._lateralTorsionalBucking.P_n_c_LTB);
    } else {
      return this._flexuralBuckling ? this._flexuralBuckling.P_n_c_FB : this._lateralTorsionalBucking.P_n_c_LTB;
    }
  }
}