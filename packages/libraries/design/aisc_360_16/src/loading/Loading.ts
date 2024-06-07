import { ILTBLoads } from "../members/loads";

export interface IAxial {
  compression?: number;
  tension?: number;
}

export class AxialLoads implements IAxial {
  readonly compression: number;
  readonly tension: number;

  constructor(props?: IAxial) {
    this.compression = props?.compression ?? 0;
    this.tension = props?.tension ?? 0;
  }
}


export interface IMajorMinorLoads {
  major: number;
  minor: number;
}

export class MajorMinorLoads implements IMajorMinorLoads {
  readonly major: number;
  readonly minor: number;

  constructor(props?: IShear) {
    this.major = props?.major ?? 0;
    this.minor = props?.minor ?? 0;
  }
}

export interface IShear extends IMajorMinorLoads { }

export class ShearLoads extends MajorMinorLoads { }

export interface IFlexure extends IMajorMinorLoads { }

export class FlexureLoads extends MajorMinorLoads { }

export interface IFlexureSigned {
  positive?: IFlexure;
  negative?: IFlexure;
}

export class FlexureSigned implements IFlexureSigned {
  readonly positive: IFlexure;
  readonly negative: IFlexure;

  constructor(props?: IFlexureSigned) {
    this.positive = props?.positive ?? new FlexureLoads();
    this.negative = props?.negative ?? new FlexureLoads();
  }
}

export interface ISectionLoads {
  axial?: IAxial;
  shear?: IShear;
  flexure?: IFlexureSigned;
  torsion?: number;
}

export class SectionLoads implements ISectionLoads {
  readonly axial: IAxial;
  readonly shear: IShear;
  readonly flexure: IFlexureSigned;
  readonly torsion: number;

  constructor(props?: ISectionLoads) {
    this.axial = new AxialLoads(props.axial);
    this.shear = new ShearLoads(props.shear);
    this.flexure = new FlexureSigned(props.flexure);
    this.torsion = props.torsion ?? 0;
  }
}

export interface IMemberLoads {
  stations: { [key: string]: ISectionLoads };
  flexure: {
    major: {
      max: {
        station: string;
        loads: ISectionLoads;
      }
      span?: {
        max?: {
          station: string;
          loads: ISectionLoads;
        }[]
        zeroes?: {
          station: string;
          loads: ISectionLoads;
        }[]
      }
    }
    minor: {
      max: {
        station: string;
        loads: ISectionLoads;
      }
      span?: {
        max?: {
          station: string;
          loads: ISectionLoads;
        }
        zero?: {
          station: string;
          loads: ISectionLoads;
        }
      }
    }
  };
  shear: {
    major: {
      max: {
        station: string;
        loads: ISectionLoads;
      }
      span?: {
        max?: {
          station: string;
          loads: ISectionLoads;
        }
        zero?: {
          station: string;
          loads: ISectionLoads;
        }
      }
    }
    minor: {
      max: {
        station: string;
        loads: ISectionLoads;
      }
      span?: {
        max?: {
          station: string;
          loads: ISectionLoads;
        }
        zeroes?: {
          station: string;
          loads: ISectionLoads;
        }[]
      }
    }
  };
}

// TODO: For load generation:
// M_max & position calced from loading
// Loading requires M @ 0, 0.25, 0.5, 0.75, 1
// Loading stations are ratios from 0 to 1
// Make loading class where this structure is formed, with proper defaults of 0 added
export class MemberLoads implements IMemberLoads {
  private _stationsList: number[];
  readonly stations: { [key: string]: ISectionLoads };

  private _LTB: ILTBLoads;
  get LTB(): ILTBLoads {
    if (!this._LTB) {
      this.calcLTB();
    }
    return this._LTB;
  }

  constructor(props: IMemberLoads) {
    this._stationsList = [0, 0.25, 0.5, 0.75, 1];

    const stations = Object.keys(props);
    if (stations.length === 1) {
      // assign constant
      const loads = Object.values(props)[0];
      // TODO: ForEach from stationsList
      this.stations['0'] = loads;
      this.stations['0.25'] = loads;
      this.stations['0.5'] = loads;
      this.stations['0.75'] = loads;
      this.stations['1'] = loads;
    } else {
      //  assign values, interpolate/extrapolate for key positions
      // TODO: ForEach from props

      // TODO: ForEach from stationsList
      if (!this.stations['0']) {
        this.stations['0'] = this.atStation(0);
      }

      if (!this.stations['0.25']) {
        this.stations['0.25'] = this.atStation(0.25);
      }

      if (!this.stations['0.5']) {
        this.stations['0.5'] = this.atStation(0.5);
      }

      if (!this.stations['0.75']) {
        this.stations['0.75'] = this.atStation(0.75);
      }

      if (!this.stations['1']) {
        this.stations['1'] = this.atStation(1);
      }

      // assign max flexure major/minor
      // assign max shear major/minor
    }
  }

  // TODO: Methods to get max (flexure, shear, major/minor?)
  // TODO: Methods to get max span
  // TODO: Methods to get zero-force span

  atStation(station: number): ISectionLoads {
    //  Fetch at station
    const loads = this[station.toString()];

    //  If station does not exist,
    if (!loads) {
      if (station === 0) {
        // get linear extrapolation to start from first 2 stations using _stationsList

      } else if (station === 1) {
        // get linear extrapolation to end from last 2 stations using _stationsList

      } else {
        // get linear interpolation between neighboring stations using _stationsList excluding station sought

      }

    }
  }

  private calcLTB(): ILTBLoads {
    // TODO: Generate ILTBLoads from MemberLoads class and/or allow optional manual assignment
    // const ltbLoads: ILTBLoads = {
    //   M_max_position: {
    //     major: 0,
    //     minor: 0
    //   },
    //   M_max: undefined,
    //   M_0_0: undefined,
    //   M_1_4: undefined,
    //   M_1_2: undefined,
    //   M_3_4: undefined,
    //   M_1_0: undefined
    // };
  }
}