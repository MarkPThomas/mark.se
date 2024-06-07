import { IFlexure, IMajorMinorLoads } from "../loading";
import { IMomentGradientProperties } from "./buckling/MomentGradient";

// TODO: Considerations
//  1. Section uses a different loads object that needs to be converted w/ IDemandProps
//  2. Section currently only uses it for presence of bending
//  3. Section could need it for interactions of section capacities only (e.g. section designer)
//  Should they be consolidated/simplified? Is there ever a case  where member capacities are not desired?
//    Could fallback on those by just making member very short w/ defaults for simplicity & ensuring they don't govern

// TODO: Add these into BendingLTB?
export interface ILTBLoads {
  L: number;
  M_max_position: IMajorMinorLoads;
  M_max: IFlexure;
  M_0_0: IFlexure;
  M_1_4: IFlexure;
  M_1_2: IFlexure;
  M_3_4: IFlexure;
  M_1_0: IFlexure;
}

export function getMajorLoads(loads: ILTBLoads): IMomentGradientProperties {
  return {
    M_max_position: loads.M_max_position.major,
    M_max: loads.M_max.major,
    M_0_0: loads.M_0_0.major,
    M_1_4: loads.M_1_4.major,
    M_1_2: loads.M_1_2.major,
    M_3_4: loads.M_3_4.major,
    M_1_0: loads.M_1_0.major,
  }
}

export function getMinorLoads(loads: ILTBLoads): IMomentGradientProperties {
  return {
    M_max_position: loads.M_max_position.minor,
    M_max: loads.M_max.minor,
    M_0_0: loads.M_0_0.minor,
    M_1_4: loads.M_1_4.minor,
    M_1_2: loads.M_1_2.minor,
    M_3_4: loads.M_3_4.minor,
    M_1_0: loads.M_1_0.minor,
  }
}