import { ElementCompactness, IElementCompactnessProps } from "./ElementCompactness";

export interface IElementCompactnessLoads {
  // Element is the piece of the cross section,
  //  Load is oriented to the cross section and NOT the piece
  axialCompression: ElementCompactness;
  flexureMajor: ElementCompactness;
  flexureMinor: ElementCompactness;
  shearMajor: ElementCompactness;
  shearMinor: ElementCompactness;
}


export interface IElementCompactnesses extends IElementCompactnessLoads {
  E: number;
  F_y: number;
  b: number;
  t: number;
  lambda: number;
}

export abstract class ElementCompactnessSet implements IElementCompactnesses {
  // These can be in a single element. Perhaps passed to child classes as private properties
  readonly E: number;
  readonly F_y: number;

  // width
  readonly b: number;
  // thickness
  readonly t: number;
  // Width-thickness ratio
  get lambda(): number {
    return this.t ? this.b / this.t : Infinity;
  }

  protected _axialCompression: ElementCompactness;
  get axialCompression(): ElementCompactness {
    return this._axialCompression;
  }

  protected _flexureMajor: ElementCompactness;
  get flexureMajor(): ElementCompactness {
    return this._flexureMajor;
  }

  protected _flexureMinor: ElementCompactness;
  get flexureMinor(): ElementCompactness {
    return this._flexureMinor;
  }

  protected _shearMajor: ElementCompactness;
  get shearMajor(): ElementCompactness {
    return this._shearMajor;
  }

  protected _shearMinor: ElementCompactness;
  get shearMinor(): ElementCompactness {
    return this._shearMinor;
  }

  constructor(props: IElementCompactnessProps) {
    this.E = props.E;
    this.F_y = props.F_y;
    this.b = props.length;
    this.t = props.thickness;
  }
}