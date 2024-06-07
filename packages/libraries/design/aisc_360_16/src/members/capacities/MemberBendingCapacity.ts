import { BendingLTB } from "./BendingLTB";
import {
  SectionBendingCapacity as SectionBendingCapacity,
  ISectionBendingCapacityProps as ISectionBendingCapacityProps
} from "../../sections/capacities/SectionBendingCapacity";

export interface IBendingCapacityProps<
  T1 extends ISectionBendingCapacityProps,
  T2 extends IMemberBendingProps
> extends IMemberBendingProps {
  sectionCapacities: SectionBendingCapacity<T1, T2>;
}

export interface IMemberBendingProps {
  K_LTB: number;
  L_b_LTB: number;
  L_b_ratio: number;

  C_b: number; // Moment gradient. Loading dependent.
}

export interface IMemberBendingCapacity<T extends IMemberBendingProps> {
  M_n_LTB: number;
}

export class MemberBendingCapacity<
  T1 extends ISectionBendingCapacityProps,
  T2 extends IMemberBendingProps
> implements IMemberBendingCapacity<T2> {
  private M_p: number;

  private _lateralTorsionalBucking: BendingLTB<T2>;

  constructor(props: IBendingCapacityProps<T1, T2>) {
    const sectionCapacities = props.sectionCapacities;
    this.M_p = props.sectionCapacities.M_p_major;
    this._lateralTorsionalBucking = sectionCapacities.LTB(props);
  }

  // AISC F2-1, F2-2, F2-3
  get M_n_LTB() {
    return this._lateralTorsionalBucking
      ? this._lateralTorsionalBucking.M_n_LTB
      : this.M_p;
  }
}