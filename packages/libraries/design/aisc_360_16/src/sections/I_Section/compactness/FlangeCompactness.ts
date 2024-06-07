import {
  ElementCompactness,
  ElementCompactnessSet,
  IElementCompactnessProps,
  ShearCompactnessFree
} from "../../buckling/compactness";
import { IWelded } from "../../buckling/WeldedFactors";

export interface IFlangeCompactnessProps extends IElementCompactnessProps {
  builtUpFactors?: IWelded;
}

abstract class FlangeCompactness extends ElementCompactness {
  readonly builtUpFactors?: IWelded;

  constructor(props: IFlangeCompactnessProps) {
    super(props);

    this.builtUpFactors = props.builtUpFactors;
  }
}

// AISC B4.1, Table B4.1a
export class FlangeCompactnessCompression extends FlangeCompactness {
  nonCompactLimit(): number {
    return this.builtUpFactors
      ? 0.64 * Math.sqrt(this.builtUpFactors.k_c * this.E / this.builtUpFactors.F_L)
      : 0.56 * Math.sqrt(this.E / this.F_y);
  }
}

// AISC B4.3, Table B4.1b
export class FlangeCompactnessFlexureMajor extends FlangeCompactness {
  compactLimit(): number {
    return 0.38 * Math.sqrt(this.E / this.F_y);
  }

  nonCompactLimit(): number {
    return this.builtUpFactors
      ? 0.95 * Math.sqrt(this.builtUpFactors.k_c * this.E / this.builtUpFactors.F_L)
      : Math.sqrt(this.E / this.F_y);
  }
}

export class FlangeCompactnessSet extends ElementCompactnessSet {
  readonly builtUpFactors?: IWelded;

  constructor(props: IFlangeCompactnessProps) {
    super(props);

    this.builtUpFactors = props.builtUpFactors;

    this._axialCompression = new FlangeCompactnessCompression(props);
    this._flexureMajor = new FlangeCompactnessFlexureMajor(props);
    this._shearMinor = new ShearCompactnessFree(props);
  }
}