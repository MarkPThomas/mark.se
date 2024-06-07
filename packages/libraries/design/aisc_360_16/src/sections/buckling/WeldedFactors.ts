// Only used in singly & doubly-symmetric I Sections, Channels & Double Channels

export interface IWeldedProps {
  F_y: number,
  h: number,
  t_w: number,
  S_majorPositive: number,
  S_majorNegative: number
}

export interface IWelded {
  // AISC Table B4.1b Note a
  k_c: number;
  // AISC F4-6a, Table B4.1b Note b - Doubly vs. Singly-Symmetric Sections
  F_L: number;
}

export class WeldedFactors {
  private _props: IWeldedProps;

  constructor(props: IWeldedProps) {
    this._props = props;
  }

  // AISC F4.3 Table B4.1b Note a
  get k_c() {
    if (this._k_c === undefined) {
      this._k_c = this.calc_k_c();
    }
    return this._k_c;
  }
  private _k_c: number;
  private calc_k_c() {
    const { h, t_w } = this._props;

    return Math.max(0.35, Math.min(4 / Math.sqrt(h / t_w), 0.763));
  }

  // AISC F4-6a, F4.3 Table B4.1b Note b - Doubly vs. Singly-Symmetric Sections
  get F_L() {
    if (this._F_L === undefined) {
      this._F_L = this.calc_F_L();
    }
    return this._F_L;
  }
  private _F_L: number;
  private calc_F_L() {
    const { F_y, S_majorPositive, S_majorNegative } = this._props;

    const S_major_ratio = (S_majorPositive && S_majorNegative)
      ? S_majorNegative > S_majorPositive ? S_majorPositive / S_majorNegative : S_majorNegative / S_majorPositive
      : 1;

    return Math.max(0.5, Math.min(S_major_ratio, 0.7)) * F_y;
  }
}