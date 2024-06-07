export interface IMemberBucklingGeometries {
  L_b: number;
  K?: number;
}

export interface IMemberBucklingProperties extends IMemberBucklingGeometries {
  L_cr: number;
}

export class MemberBucklingProperties implements IMemberBucklingProperties {
  readonly L_b: number;
  readonly K: number;

  get L_cr(): number {
    return this.K * this.L_b;
  }

  constructor(props: IMemberBucklingGeometries, L: number = Infinity) {
    this.L_b = Math.min(props?.L_b, L);
    this.K = props?.K ?? 1;
  }
}