import { IMaterial } from "../materials/Material";

import { eFrameType } from "./enums";
import { ISectionGeometry } from "./SectionGeometry";

// Below is for WSection. Look at generalizing.
import {
  SectionAxialCapacity,
  SectionBendingCapacity,
  ISectionBendingCapacityProps,
  IBendingLTBProps,
  SectionShearCapacity
} from "./capacities";
import { SectionCompactness, ISectionCompactnessElements } from "./buckling/compactness";
import { ISectionLoads } from "../loading";

export interface ISectionProps<T extends ISectionGeometry> {
  geometry: T;  // TODO: Extract to external cross-section library that is code-agnostic. GUID.
  material: IMaterial;  // TODO: Extract to external material library that is code-agnostic. GUID.
  hasCompressionLTB?: boolean;
  frameType?: eFrameType;
  loads?: ISectionLoads;  // TODO: Remove?
}

export interface ISection<
  T extends ISectionGeometry,
  T1 extends ISectionCompactnessElements,
  T2 extends ISectionBendingCapacityProps,
  T3 extends IBendingLTBProps
> {
  geometry: T;
  material: IMaterial;
  frameType: eFrameType;
  compactness: SectionCompactness<T1>;
  hasCompressionLTB: boolean;

  A_effective(F_cr: number): number;
  r_t_prime: number;
  C_prime: number;
  L_p: number;
  L_r: number;

  axialCapacities(): SectionAxialCapacity;
  bendingCapacities(): SectionBendingCapacity<T2, T3>;
  shearCapacities(): SectionShearCapacity;
}

// TODO:
// Add GUID
// Create lazy-loading material store
export abstract class Section<
  T extends ISectionGeometry,
  T1 extends ISectionCompactnessElements,
  T2 extends ISectionBendingCapacityProps,
  T3 extends IBendingLTBProps
> implements ISection<T, T1, T2, T3> {
  readonly geometry: T;          // TODO: For most shapes, this can follow flywheel pattern, with GUID reference here
  readonly material: IMaterial;  // TODO: Material can follow flywheel pattern, with GUID reference here
  readonly frameType: eFrameType = eFrameType.beam;
  readonly hasCompressionLTB: boolean;
  readonly loads: ISectionLoads;

  protected _compactness: SectionCompactness<T1>;
  get compactness(): SectionCompactness<T1> {
    if (!this._compactness) {
      this.constructSectionCompactness();
    }
    return this._compactness;
  }

  constructor(props: ISectionProps<T>) {
    //  TODO: Initialize w/ material & geometry GUIDs
    //    Consider intialization w/ GUIDs OR properties for each.
    //      w/ properties, assume new object. Instantiate here? vs. some dispatch to object store
    //    Store GUID vs. object reference? Depends on if in microservices where object stores are at other services
    //      Local store to current service generates objects
    //    Base case is w/ objects. Refactor out later once generating local object store
    this.geometry = props.geometry;
    this.material = props.material;

    this.frameType = props.frameType;
    this.hasCompressionLTB = props.hasCompressionLTB;

    //TODO: Consider removing
    this.loads = props.loads;
  }

  protected abstract constructSectionCompactness(): void;

  abstract get r_t_prime(): number;
  abstract get C_prime(): number;

  abstract get L_p(): number;
  abstract get L_r(): number;

  abstract A_effective(F_cr: number): number;

  abstract axialCapacities(): SectionAxialCapacity;
  abstract bendingCapacities(): SectionBendingCapacity<T2, T3>;
  abstract shearCapacities(): SectionShearCapacity;
}