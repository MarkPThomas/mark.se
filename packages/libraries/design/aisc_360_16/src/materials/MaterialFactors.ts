export interface IMaterialFactors {
  phi_c: number;
  phi_t_gross: number;
  phi_t_net: number;
  phi_b: number;
  phi_v: number;
}

export class MaterialFactors {
  static readonly phi_c: number = 0.9;
  static readonly phi_t_gross: number = 0.9;  // AISC D2.a
  static readonly phi_t_net: number = 0.75;   // AISC D2.b
  static readonly phi_b: number = 0.9;        // AISC F1(1)
  static readonly phi_v: number = 0.9;        // AISC G1
}

export const phi_c: number = 0.9;
export const phi_t_gross: number = 0.9;  // AISC D2.a
export const phi_t_net: number = 0.75;   // AISC D2.b
export const phi_b: number = 0.9;        // AISC F1(1)
export const phi_v: number = 0.9;        // AISC G1
// TODO: Work out MateriaFactors as backing to overwrites of each phi