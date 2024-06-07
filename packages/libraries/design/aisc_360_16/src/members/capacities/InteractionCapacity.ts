import { IShear, ISectionLoads } from "../../loading";

export interface ICapacityProps {
  P_c_compression: number;  // Design capacity
  P_c_tension: number;

  V_c_minor: number;
  V_c_major: number;

  M_c_minor: number;
  M_n_minorSection: number;

  M_c_major: number;
  M_c_majorNoLTB: number;
  M_c_major_C_b_1: number;

  T_c: number;
}

export interface IDemandProps {
  P_r_compression: number; // Design forces
  P_r_tension: number;
  V_r_minor: number;
  V_r_major: number;
  M_r_minor: number;
  M_r_major: number;
  T_r: number;
}
// Note: Section uses ISectionLoads, which:
//  Has minor/major as child props
//  Includes +/- bending
//  Make a way to convert between these two, as a class or method.

export interface IInteractionCapacityProps {
  demand: IDemandProps;
  capacity: ICapacityProps;
  C_b: number;
}

export interface IInteractionCapacityPMM {
  PMM: number;
  InstabilityInPlane: number;
  InstabilityOutOfPlane: number;
}

export interface IInteractionCapacityTMM {
  TMM: number;
  InstabilityOutOfPlane: number;
}

export interface IInteractionCapacity {
  isMinorAxisBendingNegligible: boolean;
  D_C_BendingCompression: IInteractionCapacityPMM;
  D_C_BendingTension: IInteractionCapacityTMM;
  D_C_V: IShear;
  D_C_T: number;
}

export interface IStationCapacity {
  [key: string]: IInteractionCapacity;
}

export interface IDemandCapacity {
  station: string;
  D_C: IInteractionCapacity;
}

export interface IGoverningDemandCapacities {
  PMM: IDemandCapacity;
  V_minor: IDemandCapacity;
  V_major: IDemandCapacity;
}

export interface IDemandCapacities {
  governing: IGoverningDemandCapacities;
  stations: IStationCapacity // D_C for each station
}

export class DemandCapacities implements IDemandCapacities {
  readonly governing: IGoverningDemandCapacities;
  readonly stations: IStationCapacity;

  constructor() {
    this.governing = new GoverningCapacities();
  }
}

class GoverningCapacities implements IGoverningDemandCapacities {
  PMM: null;
  V_minor: null;
  V_major: null;
}

export class InteractionCapacity implements IInteractionCapacity {
  private _props: IInteractionCapacityProps;

  readonly D_C_BendingCompression: IInteractionCapacityPMM;
  readonly D_C_BendingTension: IInteractionCapacityTMM;
  readonly D_C_V: IShear;
  readonly D_C_T: number;

  constructor(props: IInteractionCapacityProps) {
    this._props = props;

    this.D_C_BendingCompression.PMM = this.calc_PMM();
    this.D_C_BendingCompression.InstabilityInPlane = this.calc_PMM_a();
    this.D_C_BendingCompression.InstabilityOutOfPlane = this.calc_PMM_b();

    this.D_C_BendingTension.TMM = this.calc_TMM();
    this.D_C_BendingTension.InstabilityOutOfPlane = this.calc_TMM_b();

    this.D_C_V.minor = this.calc_V_minor();
    this.D_C_V.major = this.calc_V_major();
  }

  static getDemands(loads: ISectionLoads): IDemandProps {
    return {
      P_r_compression: loads.axial.compression,
      P_r_tension: loads.axial.tension,
      V_r_minor: loads.shear.minor,
      V_r_major: loads.shear.major,
      M_r_minor: Math.max(loads.flexure.positive.minor, loads.flexure.negative.minor),
      M_r_major: Math.max(loads.flexure.positive.major, loads.flexure.negative.major),
      T_r: loads.torsion
    }
  }

  get isMinorAxisBendingNegligible(): boolean {
    const M_r_minor = this._props.demand.M_r_minor;
    const M_n_minorSection = this._props.capacity.M_n_minorSection;

    return M_r_minor < 0.001 * M_n_minorSection;
  }

  get P_compression_ratio(): number {
    const { P_r_compression } = this._props.demand;
    const { P_c_compression } = this._props.capacity;

    return P_r_compression / P_c_compression;
  }

  get P_tension_ratio(): number {
    const { P_r_tension } = this._props.demand;
    const { P_c_tension } = this._props.capacity;

    return P_r_tension / P_c_tension;
  }

  get M_minor_ratio(): number {
    const { M_r_minor } = this._props.demand;
    const { M_c_minor } = this._props.capacity;

    return M_r_minor / M_c_minor;
  }

  get M_major_ratio(): number {
    const { M_r_major } = this._props.demand;
    const { M_c_major } = this._props.capacity;

    return M_r_major / M_c_major;
  }

  get M_majorNoLTB_ratio(): number {
    const { M_r_major } = this._props.demand;
    const { M_c_majorNoLTB } = this._props.capacity;

    return M_r_major / M_c_majorNoLTB;
  }

  get M_major_C_b_1_ratio(): number {
    const { M_r_major } = this._props.demand;
    const { M_c_major_C_b_1 } = this._props.capacity;

    return M_r_major / M_c_major_C_b_1;
  }


  // AISC H1-1a
  private calc_H1_1a(): number {
    return this.P_compression_ratio + (8 / 9) * (this.M_minor_ratio + this.M_major_ratio);
  }

  // AISC H1-1b
  private calc_H1_1b(): number {
    return 0.5 * (this.P_compression_ratio) + (this.M_minor_ratio + this.M_major_ratio);
  }

  // AISC H1-1a, H1-1b
  private calc_PMM(): number {
    return this.P_compression_ratio >= 0.2 ? this.calc_H1_1a() : this.calc_H1_1b();
  }

  // AISC H1-1a, H1.3a
  private calc_H1_1a_1_3_a(): number {
    return this.P_compression_ratio + (8 / 9) * (this.M_minor_ratio + this.M_majorNoLTB_ratio);
  }

  // AISC H1-1b, H1.3a
  private calc_H1_1b_1_3_a(): number {
    return 0.5 * (this.P_compression_ratio) + (this.M_minor_ratio + this.M_majorNoLTB_ratio);
  }

  // AISC H1-1a, H1-1b, H1.3a
  private calc_PMM_a(): number {
    if (this.isMinorAxisBendingNegligible) {
      return 0;
    }

    return this.P_compression_ratio >= 0.2 ? this.calc_H1_1a_1_3_a() : this.calc_H1_1b_1_3_a();
  }

  // AISC H1-2
  private calc_PMM_b(): number {
    if (this.isMinorAxisBendingNegligible) {
      return 0;
    }

    return this.P_compression_ratio * (1.5 - 0.5 * this.P_compression_ratio) + (this.M_major_C_b_1_ratio / this._props.C_b) ** 2;
  }

  // AISC H1-1a, H1.2
  private calc_H1_1a_1_2(): number {
    return this.P_tension_ratio + (8 / 9) * (this.M_minor_ratio + this.M_major_ratio);
  }

  // AISC H1-1b, H1.2
  private calc_H1_1b_1_2(): number {
    return 0.5 * this.P_tension_ratio + (this.M_minor_ratio + this.M_major_ratio);
  }

  // AISC H1-1a, H1-1b, H1.2
  private calc_TMM(): number {
    return this.P_tension_ratio >= 0.2 ? this.calc_H1_1a_1_2() : this.calc_H1_1b_1_2();
  }

  // AISC H1-2
  private calc_TMM_b(): number {
    if (this.isMinorAxisBendingNegligible) {
      return 0;
    }

    return (this.M_major_C_b_1_ratio / this._props.C_b) ** 2;
  }

  private calc_V_minor(): number {
    const V_r_minor = this._props.demand.V_r_minor;
    const V_c_minor = this._props.capacity.V_c_minor;

    return V_r_minor / V_c_minor;
  }

  private calc_V_major(): number {
    const V_r_major = this._props.demand.V_r_major;
    const V_c_major = this._props.capacity.V_c_major;

    return V_r_major / V_c_major;
  }
}