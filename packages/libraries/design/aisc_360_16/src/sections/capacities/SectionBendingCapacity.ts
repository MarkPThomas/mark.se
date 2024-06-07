import { IMemberBendingProps } from "../../members/capacities/MemberBendingCapacity";
import { BendingLTB } from "../../members/capacities/BendingLTB";

export interface ISectionBendingCapacityProps {
  F_y: number;

  S_positive_major: number
  S_positive_minor: number

  Z_positive_major: number;
  Z_positive_minor: number;
}

export interface ISectionBendingCapacity<T extends IMemberBendingProps> {
  M_y_major: number;
  M_y_minor: number;

  M_p_major: number;
  M_p_minor: number;

  LTB(memberProps: IMemberBendingProps): BendingLTB<T>;
}

export class SectionBendingCapacity<T extends ISectionBendingCapacityProps, T2 extends IMemberBendingProps>
  implements ISectionBendingCapacity<T2> {

  protected _props: T;

  constructor(props: T) {
    this._props = props;
  }

  // AISC F2-1
  get M_y_major(): number {
    const { F_y, S_positive_major } = this._props;

    return F_y * S_positive_major;
  }

  // AISC F6-1
  get M_y_minor(): number {
    const { F_y, S_positive_minor } = this._props;

    return F_y * S_positive_minor;
  }

  // AISC F2-1
  get M_p_major(): number {
    const { F_y, Z_positive_major } = this._props;

    return F_y * Z_positive_major;
  }

  // AISC F6-1
  get M_p_minor(): number {
    const { F_y, Z_positive_minor } = this._props;

    return F_y * Z_positive_minor;
  }

  LTB(memberProps: IMemberBendingProps): BendingLTB<T2> {
    return null;
  }
}