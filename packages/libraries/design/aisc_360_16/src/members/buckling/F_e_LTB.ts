import { eSectionType } from "../../sections/enums";

interface IF_e_LTBProps {
  // material
  E: number;
  G: number;

  // section
  A_g: number;
  x_o: number;
  y_o: number;
  r_o_bar: number;
  H: number;
  I_major: number;
  I_minor: number;
  C_w: number;
  J: number;

  // member
  L_cr_LTB: number;
  KL_r_major: number;
  KL_r_minor: number;
}

export interface IF_e_LTB {
  F_e_major: number;
  F_e_minor: number;
  F_e_polar: number;

  getBy(sectionType: eSectionType, width: number, height: number): number;

  I_shape: number;
  Channel: number;
  DoubleChannel: number;
  T_shape: number;
  DoubleAngle: number;
  AngleEqualLegs: number;
  AngleUnequalLegs: number;
}

export class F_e_LTB implements IF_e_LTB {
  private _props: IF_e_LTBProps;

  constructor(props: IF_e_LTBProps) {
    this._props = props;
  }

  getBy(sectionType: eSectionType, width: number, height: number): number {
    switch (sectionType) {
      case eSectionType.I_shape:
        return this.I_shape;
      case eSectionType.Channel:
        return this.Channel;
      case eSectionType.DoubleChannel:
        return this.DoubleChannel;
      case eSectionType.T_shape:
        return this.T_shape;
      case eSectionType.DoubleAngle:
        return this.DoubleAngle;
      case eSectionType.Angle:
        return width === height ? this.AngleEqualLegs : this.AngleUnequalLegs;
    }
  }

  get F_e_major(): number {
    const { E, KL_r_major } = this._props;

    return Math.PI ** 2 * E / KL_r_major ** 2;
  }

  get F_e_minor(): number {
    const { E, KL_r_minor } = this._props;

    return Math.PI ** 2 * E / KL_r_minor ** 2;
  }

  get F_e_polar(): number {
    const { E, C_w, L_cr_LTB, G, J, A_g, r_o_bar } = this._props;

    return (Math.PI ** 2 * E * C_w / L_cr_LTB ** 2 + G * J) / (A_g * r_o_bar ** 2);
  }

  // AISC E4-2
  get I_shape(): number {
    const { E, C_w, L_cr_LTB, G, J, I_major, I_minor } = this._props;

    // F_e_polar w/ x_o = 0 & y_o = 0
    return (Math.PI ** 2 * E * C_w / L_cr_LTB ** 2 + G * J) / (I_minor + I_major);
  }

  // AISC E4-2
  get DoubleChannel() {
    return this.I_shape;
  }

  // AISC E4-3
  get Channel() {
    const { H } = this._props;

    return ((this.F_e_major + this.F_e_polar) / (2 * H))
      * (1 - Math.sqrt(1 - 4 * this.F_e_major * this.F_e_polar * H / (this.F_e_major + this.F_e_polar) ** 2));
  }

  // AISC E4-3
  get T_shape() {
    const { H } = this._props;

    return ((this.F_e_minor + this.F_e_polar) / (2 * H))
      * (1 - Math.sqrt(1 - 4 * this.F_e_minor * this.F_e_polar * H / (this.F_e_major + this.F_e_polar) ** 2));
  }

  // AISC E4-3
  get DoubleAngle() {
    return this.T_shape;
  }

  // AISC E4-3, E4b Note
  get AngleEqualLegs() {
    return this.Channel;
  }

  // AISC E4-4
  get AngleUnequalLegs() {
    // TODO: Implement from notes
    return 1;
  }
}