import { IMemberGeometries } from "./MemberGeometries";
import {
  IMemberBucklingProperties,
  MemberBucklingProperties
} from "./buckling/MemberBucklingProperties";
import { MomentGradient } from "./buckling/MomentGradient";
import {
  ILTBLoads,
  getMajorLoads,
  getMinorLoads
} from "./loads";

export interface IMemberProperties {
  L: number;
  R_m: number;

  minorBuckling: IMemberBucklingProperties;
  majorBuckling: IMemberBucklingProperties;
  LTB: IMemberBucklingProperties;

  C_b_major: MomentGradient;
  C_b_minor: MomentGradient;
}

export interface Overwrites {
  C_b_major?: number;
  C_b_minor?: number;
}

export class MemberProperties implements IMemberProperties {
  readonly L: number;
  readonly R_m: number;

  readonly minorBuckling: IMemberBucklingProperties;
  readonly majorBuckling: IMemberBucklingProperties;
  readonly LTB: IMemberBucklingProperties;

  private _overwrites: Overwrites;
  private _C_b_major: MomentGradient;
  get C_b_major(): MomentGradient {
    return this._C_b_major;
  }
  private _C_b_minor: MomentGradient;
  get C_b_minor(): MomentGradient {
    return this._C_b_minor;
  }

  constructor(props: IMemberGeometries, overwrites?: Overwrites) {
    this.L = props.L;
    this.R_m = props.R_m;

    this.minorBuckling = new MemberBucklingProperties(props.minorBuckling, this.L);
    this.majorBuckling = new MemberBucklingProperties(props.majorBuckling, this.L);
    this.LTB = new MemberBucklingProperties(props.LTB, this.L);

    this._overwrites = overwrites;
    if (this._overwrites) {
      // TODO: generate objects from overwrites
    } else {
      // TODO: generate objects w/ defaults of 1
    }
  }

  setLoads(loads: ILTBLoads) {
    if (!this._overwrites) {
      this._C_b_major = new MomentGradient(getMajorLoads(loads), this._overwrites?.C_b_major);
      this._C_b_minor = new MomentGradient(getMinorLoads(loads), this._overwrites?.C_b_minor);
    }
  }
}