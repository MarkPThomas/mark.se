import {
  ElementCompactness,
  ElementCompactnessSet,
  IElementCompactnessProps,
  ShearCompactnessFree
} from "../../buckling/compactness";
import { eFrameType } from "../../enums";

export interface IWebCompactnessProps extends IElementCompactnessProps {
  frameType: eFrameType;
}

abstract class WebCompactness extends ElementCompactness {
  readonly frameType: eFrameType;

  constructor(props: IWebCompactnessProps) {
    super(props);

    this.frameType = props.frameType ?? eFrameType.beam;
  }
}

// AISC B4.1, Table B4.1a
export class WebCompactnessCompression extends WebCompactness {
  nonCompactLimit(): number {
    return 1.49 * Math.sqrt(this.E / this.F_y);
  }
}

// AISC Table B4.1
export class WebCompactnessFlexureMajor extends WebCompactness {
  compactLimit(): number {
    return 3.76 * Math.sqrt(this.E / this.F_y);
  }
  nonCompactLimit(): number {
    return 5.7 * Math.sqrt(this.E / this.F_y);
  }
  slenderLimit(): number {
    return this.frameType === eFrameType.beam ? Math.min(0.4 * this.E / this.F_y, 260) : Infinity;
  }
}

export class WebCompactnessSet extends ElementCompactnessSet {
  readonly frameType: eFrameType;

  constructor(props: IWebCompactnessProps) {
    super(props);

    this.frameType = props.frameType ?? eFrameType.beam;

    this._axialCompression = new WebCompactnessCompression(props);
    this._flexureMajor = new WebCompactnessFlexureMajor(props);
    this._shearMajor = new ShearCompactnessFree(props);
  }
}

