import { ICompactnessCriteria, eCompactness } from "./Compactness";

export interface IElementCompactnessProps {
  E: number;
  F_y: number;
  length: number;
  thickness: number;
}

export abstract class ElementCompactness implements ICompactnessCriteria {
  // These can be in a single element. Perhaps passed to child classes as private properties
  protected E: number;
  protected F_y: number;

  protected b: number;
  protected t: number;
  // Width-thickness ratio
  protected lambda: number;

  // Everything below are based on forces in the element, e.g. compression, flexure
  private _lambda_p: number;
  get lambda_p(): number {
    if (!this._lambda_p) {
      this._lambda_p = this.compactLimit();
    }
    return this.lambda_p;
  }

  private _lambda_r: number;
  get lambda_r(): number {
    if (!this._lambda_r) {
      this._lambda_r = this.nonCompactLimit();
    }
    return this._lambda_r;
  }

  private _lambda_s: number;
  get lambda_s(): number {
    if (!this._lambda_s) {
      this._lambda_s = this.slenderLimit();
    }
    return this._lambda_s;
  }

  private _lambdaRatio: number;
  get lambdaRatio(): number {
    if (!this._lambdaRatio) {
      this._lambdaRatio = this.compactnessInterpolatioRatio();
    }
    return this._lambdaRatio;
  }

  private _classification: eCompactness;
  get classification(): eCompactness {
    if (!this._classification) {
      this._classification = this.compactness();
    }
    return this._classification;
  }

  constructor(props: IElementCompactnessProps) {
    this.E = props.E;
    this.F_y = props.F_y;


    // TODO: Consider if we need all of this or if we can just provide lambda?
    //    Any difference of lambda for shear, compression, bending? In any codes?
    this.b = props.length;
    this.t = props.thickness;
    if (this.t) {
      this.lambda = this.b / this.t;
    }
  }

  isCompact(): boolean {
    return this.classification === eCompactness.compact;
  }

  isNonCompact(): boolean {
    return this.classification === eCompactness.nonCompact;
  }

  isSlender(): boolean {
    return this.classification === eCompactness.slender;
  }


  compactness(): eCompactness {
    if (this.lambda > this.compactLimit()) {
      return eCompactness.compact;
    } else if (this.lambda > this.nonCompactLimit()) {
      return eCompactness.nonCompact;
    } else if (this.lambda > this.slenderLimit()) {
      return eCompactness.slender;
    } else {
      return eCompactness.tooSlender;
    }
  }

  compactnessInterpolatioRatio(): number {
    const lambda = this.lambda;
    const lambda_p = this.compactLimit();
    const lambda_r = this.nonCompactLimit();
    const lambda_s = this.slenderLimit();

    if (lambda_p > lambda && lambda > lambda_r) {
      return (lambda - lambda_p) / (lambda_r - lambda_p)
    } else if (lambda_r > lambda && lambda > lambda_s) {
      return (lambda - lambda_r) / (lambda_s - lambda_r)
    }
  }

  compactLimit(): number {
    return 0;
  }

  abstract nonCompactLimit(): number;

  slenderLimit(): number {
    return Infinity;
  }
}