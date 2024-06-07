import { IMemberBendingProps as IMemberBendingLTBProps } from './MemberBendingCapacity';

export interface IBendingLTBProps extends IMemberBendingLTBProps { }

export interface IBendingLTB {
  M_n_LTB: number;
}

// TODO: As shapes are added, see what methods/properties should be moved here from the one in WSection
export abstract class BendingLTB<T extends IBendingLTBProps> implements IBendingLTB {
  protected _props: T;

  abstract get M_n_LTB(): number;

  constructor(props: T) {
    this._props = props;
  }
}