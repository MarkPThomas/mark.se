export interface IAxialBucklingProps {
  E: number;
  F_y: number;
  KL_r: number;
  lambda_fb: number
}

export interface IAxialBuckling { }

export abstract class AxialBuckling<T extends IAxialBucklingProps> implements IAxialBuckling {
  protected _props: T;

  constructor(props: T) {
    this._props = props;
  }

  // AISC E3-2, E3-3, E7
  protected calc_F_cr(F_e: number): number {
    const { KL_r } = this._props;

    const F_cr_compact = this.calc_F_cr_compact(F_e);
    const F_cr_slender = this.calc_F_cr_slender(F_e);

    // AISC E3-2, E3-3, E7
    const F_cr = (KL_r <= this._props.lambda_fb) ? F_cr_compact : F_cr_slender;

    return F_cr;
  }

  // AISC E3-2
  protected calc_F_cr_compact(F_e: number): number {
    const { F_y } = this._props;

    return F_y * 0.658 ** (F_y / F_e);
  }

  // AISC E3-3
  protected calc_F_cr_slender(F_e: number): number {
    return 0.877 * F_e;
  }
}