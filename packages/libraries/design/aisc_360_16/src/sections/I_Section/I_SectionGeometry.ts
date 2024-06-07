import { ISectionGeometry } from "../SectionGeometry";
import { eSectionType } from "../enums";

// TODO: See if singly- vs. doubly-symmetric sections can use this same class
// Differentiated by suplied properties (different bottom flange props)
export interface I_I_SectionGeometry extends ISectionGeometry {
  d: number;
  // b: number;

  // web: IWeb;
  // flange_top: IFlange;
  // flange_bot?: IFlange;
  r_fillet?: number;

  t_w: number;
  t_f: number;
  b_f: number;
  b_f_bot?: number;
  t_f_bot?: number;

  // slenderness reduction props
  b_flange?: number;
  b_web?: number;

  h?: number;
  h_c?: number;
  h_p?: number;
  h_w?: number;
  h_o?: number;

  I_c_major?: number;

  beta_f?: number;

  a_w?: number
  I_c__I_major?: number
}

export class I_SectionGeometry implements I_I_SectionGeometry {
  private _overwrites: I_I_SectionGeometry;

  readonly sectionType: eSectionType = eSectionType.I_shape;
  readonly useFillets: boolean;

  get extentsWidth(): number {
    return this.b_f;
  }

  get extentsHeight(): number {
    return this.d;
  }

  // get web: IWeb;
  // get flange_top: IFlange;
  // get flange_bot?: IFlange;


  get b_f(): number {
    return this._overwrites.b_f;
  }
  get t_f(): number {
    return this._overwrites.t_f;
  }

  get t_w(): number {
    return this._overwrites.t_w;
  }

  get d(): number {
    return this._overwrites.d;
  }

  get r_fillet(): number {
    return this._overwrites.r_fillet;
  }

  // Below & other values can be calculated on the fly. Decide how/which can be overridden
  get h(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.h,
      () => this.d - 2 * this.t_f
    );
  }

  get h_c(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.h,
      () => this.h
    );
  }
  get h_p(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.h_p,
      () => this.h
    );
  }
  get h_w(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.h_w,
      () => this.d - 2 * (this.t_f + this.r_fillet)
    );
  }
  get h_o(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.h_o,
      () => this.d - this.t_f
    );
  }

  get A_g(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.A_g,
      this.calc_A_g
    );
  }
  get A_net(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.A_net,
      () => this.A_g
    );
  }
  get A_v_minor(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.A_v_minor,
      this.calc_A_v_minor
    );
  }
  get A_v_major(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.A_v_major,
      this.calc_A_v_major
    );
  }

  get I_major(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.I_major,
      this.calc_I_major
    );
  }
  get I_minor(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.I_minor,
      this.calc_I_minor
    );
  }


  get I_c_major(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.I_c_major,
      this.calc_I_yc
    );
  }

  // TODO: consider S & Z for +/- (tension, compression)
  // Base class prop
  get S_positive_major(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.S_positive_major,
      () => this.I_major / (0.5 * this.d) // TODO, consider changing to centroid
    );
  }
  get S_negative_major(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.S_negative_major,
      () => this.I_major / (0.5 * this.d) // TODO, consider changing to centroid
    );
  }

  // consider S & Z for +/-
  // Base class prop
  get S_positive_minor(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.S_positive_minor,
      () => this.I_minor / (0.5 * this.b_f)// TODO, consider changing to centroid
    );
  }
  get S_negative_minor(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.S_negative_minor,
      () => this.I_minor / (0.5 * this.b_f)// TODO, consider changing to centroid
    );
  }
  // consider S & Z for +/-
  // Base class prop
  get Z_major(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.Z_positive_major,
      this.calc_Z_major
    );
  }
  // consider S & Z for +/-
  // Base class prop
  get Z_minor(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.Z_positive_minor,
      this.calc_Z_minor
    );
  }

  // Base class prop
  get r_major(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.r_major,
      () => Math.sqrt(this.I_major / this.A_g)
    );
  }

  // Base class prop
  get r_minor(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.r_minor,
      () => Math.sqrt(this.I_minor / this.A_g)
    );
  }



  get beta_f(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.beta_f,
      () => 0.5
    );
  }

  get C_w(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.C_w,
      this.calc_C_w_Roark
    );
  }
  get J(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.J,
      this.calc_J
    );
  }
  // AISC F2-7
  get r_ts(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.r_ts,
      () => Math.sqrt(Math.sqrt(this.I_minor * this.C_w) / this.S_positive_major)
    );
  }
  // AISC F4-11, F5-2
  get r_t(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.r_t,
      () => this.b_f / Math.sqrt(12 * (this.h_o / this.d + (1 / 6) * this.a_w * (this.h ** 2 / (this.h_o * this.d))))
    );
  }
  // AISC F2-8a
  get c_compact(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.c_compact,
      () => 1
    );
  }
  // AISC F4-2
  get C_nonCompact(): number {
    return this.getOverwriteOrCalc(
      this._overwrites.C_nonCompact,
      () => this.I_c__I_major <= 0.23 ? 0 : 1
    );
  }


  // Calculated intermediate values
  // Revised section properties
  get b_flange(): number {
    return 0.5 * (this.b_f - this.t_w - 2 * this.r_fillet)
  }

  get b_web(): number {
    return this.h_w;
  }

  // Compression Flange Yielding
  get I_c__I_major(): number {
    return this.I_c_major / this.I_major;
  }

  // AISC F5.2, F4-12
  get a_w(): number {
    return Math.min(this.h_c * this.t_w / (this.b_f * this.t_f), 10);
  }

  // shear center x-coord w.r.t. centroid
  get x_o(): number {
    return 0;
  }

  // shear center y-coord w.r.t. centroid
  get y_o(): number {
    return 0;
  }

  // Polar radius of gyration about shear center w.r.t. centroid
  // AISC E4-9
  get r_o_bar(): number {
    return Math.sqrt(this.x_o ** 2 + this.y_o ** 2 + (this.I_minor + this.I_major) / this.A_g);
  }

  // AISC E4-5
  get H(): number {
    return 1 - (this.x_o ** 2 + this.y_o ** 2) / this.r_o_bar ** 2;
  }

  constructor(props: I_I_SectionGeometry, useFillets: boolean = false) {
    this._overwrites = props;
    this.useFillets = useFillets;
  }

  private getOverwriteOrCalc(overwrite: number, calc: () => number): number {
    return overwrite >= 0
      ? overwrite
      : calc();
  }

  // Base class abstract
  calc_A_g(useFillets?: boolean) {
    useFillets = useFillets ?? this.useFillets;

    const area = this.b_f * this.d - (this.b_f - this.t_w) * (this.d - 2 * this.t_f);
    const fillets = useFillets ? 0 : 0;

    return area + fillets;
  }

  // AISC G2.1
  // Base class abstract
  calc_A_v_minor() {
    return 2 * this.b_f & this.t_f;
  }

  // AISC G6
  // Base class abstract
  calc_A_v_major() {
    return this.d * this.t_w;
  }

  // Base class abstract
  calc_I_minor(useFillets?: boolean) {
    useFillets = useFillets ?? this.useFillets;

    const rotationalInertia = (1 / 12) * (this.b_f * this.d ** 3 - (this.b_f - this.t_w) * (this.d - 2 * this.t_f) ** 3);
    const fillets = useFillets ? 0 : 0;

    return rotationalInertia + fillets;
  }

  // Base class abstract
  calc_I_major(useFillets?: boolean) {
    useFillets = useFillets ?? this.useFillets;

    const rotationalInertia = (1 / 12) * (2 * this.t_f * this.b_f ** 3 + (this.d - 2 * this.t_f) * this.t_w ** 3);
    const fillets = useFillets ? 0 : 0;

    return rotationalInertia + fillets;
  }

  calc_I_yc(useFillets?: boolean) {
    useFillets = useFillets ?? this.useFillets;

    const rotationalInertia = (1 / 12) * (this.b_f * this.t_f ** 3) + (this.b_f * this.t_f) * (0.5 * this.h_o) ** 2;
    const fillets = useFillets ? 0 : 0;

    return rotationalInertia + fillets;
  }

  // Base class abstract
  calc_Z_minor(useFillets?: boolean) {
    useFillets = useFillets ?? this.useFillets;

    const plasticSectionMod = 2 * (2 * this.t_f * (this.b_f / 2) * (this.b_f / 4) + this.h * (this.t_w / 2) * (this.t_w / 4));
    const fillets = useFillets ? 0 : 0;

    return plasticSectionMod + fillets;
  }

  // Base class abstract
  calc_Z_major(useFillets?: boolean) {
    useFillets = useFillets ?? this.useFillets;

    const plasticSectionMod = 2 * (this.b_f * this.t_f * (this.h_o / 2) + this.t_w * (this.h / 2) * (this.h / 4));
    const fillets = useFillets ? 0 : 0;

    return plasticSectionMod + fillets;
  }

  // Citation?
  // Base class abstract
  calc_C_w() {
    return (1 - this.beta_f) * this.beta_f * this.I_minor * this.h_o ** 2;
  }

  // Eq. from Roark & Young, 5th Ed. 1975, Table 21 Item 7, pg. 302
  // TODO: This may be extended, along with cross-section, for t_f & b_f top & bottom
  calc_C_w_Roark() {
    return (1 / 12) * (this.h_o ** 2) * this.t_f * this.t_f * (this.b_f ** 3) * (this.b_f ** 3)
      / (this.t_f * this.b_f ** 3 + this.t_f * this.b_f ** 3);
  }

  // Base class abstract
  calc_J() {
    return (1 / 3) * (2 * (this.b_f - this.t_w) * this.t_f ** 3) + (1 / 3) * (this.h * this.t_w ** 3);
  }
}