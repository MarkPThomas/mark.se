import { divide } from "../../helper";

export interface IMomentGradientProperties {
  M_max_position: number;
  M_max: number;
  M_0_0: number;
  M_1_4: number;
  M_1_2: number;
  M_3_4: number;
  M_1_0: number;
}

export interface IMomentGradient extends IMomentGradientProperties {
  C_b: number;
}

export class MomentGradient implements IMomentGradient {
  readonly M_max_position: number;
  readonly M_max: number;
  readonly M_0_0: number;
  readonly M_1_4: number;
  readonly M_1_2: number;
  readonly M_3_4: number;
  readonly M_1_0: number;

  readonly C_b_calc: number;

  private _C_b_overwrite: number | null;
  get C_b_overwrite(): number | null {
    return this._C_b_overwrite;
  }

  get C_b(): number {
    return this.C_b_overwrite === null ? this.C_b_calc : this.C_b_overwrite;
  }

  constructor(props: IMomentGradientProperties, C_b: number = null) {
    this.M_max_position = props.M_max_position;
    this.M_0_0 = props.M_0_0;
    this.M_1_4 = props.M_1_4;
    this.M_1_2 = props.M_1_2;
    this.M_3_4 = props.M_3_4;
    this.M_1_0 = props.M_1_0;

    this.C_b_calc = MomentGradient.calc(props);
    this._C_b_overwrite = C_b;
  }

  // TODO: This may be a good base pattern, where an overwrites type can be provided, where null props are removed
  //    This allows updating & resetting individually or broadly/mixed
  updateOverwrites(updates: number = null) {
    this._C_b_overwrite = updates;
  }

  // AISC F1-1, H1.2
  static calc(loads: IMomentGradientProperties): number {
    return divide(
      12.5 * Math.abs(loads.M_max),
      2.5 * Math.abs(loads.M_max) + 3 * Math.abs(loads.M_1_4) + 4 * Math.abs(loads.M_1_2) + 3 * Math.abs(loads.M_3_4),
      1);
  }
}