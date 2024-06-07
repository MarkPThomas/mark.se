// TODO: Generalize & then have derivations:
// Steel
// Aluminum
// Cold-Formed Steel
// Concrete
// Masonry
// Wood

export interface IMaterialProperties {
  name: string;
  E: number;
  F_y: number;
  F_u: number;
  mu: number;
}

export interface IMaterial extends IMaterialProperties {
  G: number;
}

// TODO:
// Add GUID
// Create lazy-loading material store
export class Material implements IMaterial {
  readonly name: string;
  readonly E: number;
  readonly F_y: number;
  readonly F_u: number;
  readonly mu: number;

  constructor(props: IMaterialProperties) {
    this.name = props.name;
    this.E = props.E;
    this.F_y = props.F_y;
    this.F_u = props.F_u;
    this.mu = props.mu;
  }

  get G(): number {
    return this.E / (2 * (1 + this.mu));
  }
}