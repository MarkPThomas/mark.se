import { IMemberBucklingGeometries } from "./buckling/MemberBucklingProperties";


export interface IMemberGeometries {
  L: number;
  R_m?: number;

  minorBuckling?: IMemberBucklingGeometries;
  majorBuckling?: IMemberBucklingGeometries;
  LTB?: IMemberBucklingGeometries;
}

export class MemberGeometries implements IMemberGeometries {
  readonly L: number;
  readonly R_m: number;
  readonly minorBuckling: IMemberBucklingGeometries;
  readonly majorBuckling: IMemberBucklingGeometries;
  readonly LTB: IMemberBucklingGeometries;

  constructor(props: IMemberGeometries) {
    this.L = props.L;
    this.R_m = props.R_m ?? 1;

    // TODO: Consider props object vs. class for immutability & number validation
    const defaultLTBProps = {
      L_b: props.L,
      K: 1
    };
    this.minorBuckling = props.minorBuckling ?? defaultLTBProps;
    this.majorBuckling = props.majorBuckling ?? defaultLTBProps;
    this.LTB = props.LTB ?? defaultLTBProps;
  }
}