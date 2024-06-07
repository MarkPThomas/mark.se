import { phi_t_gross, phi_t_net } from "../../materials/MaterialFactors";

export interface ISectionAxialCapacityProps {
  F_y: number;
  F_u: number;
  A_g: number;
  A_net: number;
}

export interface ISectionAxialCapacity {
  P_n_t_Gross: number;
  P_n_t_Net: number;
  P_n_t: number;
}

export class SectionAxialCapacity implements ISectionAxialCapacity {
  private _props: ISectionAxialCapacityProps;

  constructor(props: ISectionAxialCapacityProps) {
    this._props = props;
  }

  // AISC D2-1
  get P_n_t_Gross(): number {
    const { F_y, A_g } = this._props;

    return F_y * A_g;
  }

  // AISC D2-2
  get P_n_t_Net(): number {
    const { F_u, A_net } = this._props;

    return F_u * A_net;
  }

  // AISC D2-1, AISC D2-2
  get P_n_t(): number {
    return Math.min(this.P_n_t_Gross, this.P_n_t_Net);
  }

  get PhiP_n_t(): number {
    return Math.min(phi_t_gross * this.P_n_t_Gross, phi_t_net * this.P_n_t_Net);
  }
}