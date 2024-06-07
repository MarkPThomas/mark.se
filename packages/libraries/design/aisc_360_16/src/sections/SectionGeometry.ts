import { eSectionType } from "./enums";

// TODO: Extract to external cross sections lib?
export interface IArea {
  gross: number;
  net?: number;
}

// TODO: Extract to external cross sections lib?
export interface IShearArea {
  major: number;      // AISC G2.1
  minor?: number;     // AISC G6
}

// TODO: Extract to external cross sections lib?
export interface IRotationalInertia {
  major: number;
  minor?: number;
}

// TODO: Extract to external cross sections lib?
export interface ISectionModulus {
  major: number;
  minor?: number;
}

// TODO: Extract to external cross sections lib?
export interface IPlasticModulus {
  major: number;
  minor?: number;
}

// TODO: Extract to external cross sections lib?
export interface IRadiusOfGyration {
  major: number;
  minor?: number;
}

// TODO: Extract to external cross sections lib?
export interface IFlange {
  t: number;
  b: number;
}

// TODO: Extract to external cross sections lib?
export interface IWeb {
  t: number;
  d: number;
  h?: number;
  h_c?: number;
  h_p?: number;
  h_w?: number;
  h_o?: number;
}

export interface ISectionGeometry {
  sectionType?: eSectionType;   // Assign in object
  extentsWidth?: number;   // Assign in object
  extentsHeight?: number;   // Assign in object

  h_o?: number;

  x_o?: number;
  y_o?: number;
  r_o_bar?: number;
  H?: number;

  // Area: IArea;
  A_g?: number;
  A_net?: number;
  // A_v?: IShearArea;
  A_v_minor?: number;   // AISC G2.1
  A_v_major?: number;   // AISC G6

  // I: IRotationalInertia;
  I_major?: number;
  I_minor?: number;

  // S_positive?: ISectionModulus;
  // S_negative?: ISectionModulus;
  S_positive_major?: number;
  S_positive_minor?: number;
  S_negative_major?: number;
  S_negative_minor?: number;

  // Z_positive?: IPlasticModulus;
  // Z_negative?: IPlasticModulus;
  Z_positive_major?: number;
  Z_positive_minor?: number;

  // r?: IRadiusOfGyration;
  r_major?: number;
  r_minor?: number;

  C_w?: number;
  J?: number;

  r_ts?: number;  // AISC F2-7
  r_t?: number;   // AISC F4-11, F5-2
  c_compact?: number;     // AISC F2-8a
  C_nonCompact?: number;     // AISC F4-2
}
