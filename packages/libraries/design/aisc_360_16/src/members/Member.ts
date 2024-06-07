import { ISectionLoads, MemberLoads } from "../loading";
import { phi_b, phi_c } from "../materials/MaterialFactors";
import { Section } from "../sections/Section";
import { ISectionGeometry } from "../sections/SectionGeometry";
import { ISectionCompactnessElements } from "../sections/buckling/compactness";
import {
  ISectionBendingCapacityProps as ISectionBendingCapacityProps,
  IBendingLTBProps
} from '../sections/capacities';
import { IMemberGeometries, MemberGeometries } from "./MemberGeometries";

import { MemberProperties } from "./MemberProperties";
import { F_e_LTB } from "./buckling/F_e_LTB";
import {
  MemberAxialCapacity,
  MemberBendingCapacity,
  InteractionCapacity, ICapacityProps, IDemandCapacities,
  DemandCapacities
} from "./capacities";

export interface IMember<
  T extends ISectionGeometry,
  T1 extends ISectionCompactnessElements,
  T2 extends ISectionBendingCapacityProps,
  T3 extends IBendingLTBProps
> {
  loadsAtStations: { [key: number]: ISectionLoads };
  section: Section<T, T1, T2, T3>;
  memberProperties: MemberProperties;
  KL_r_major: number;
  KL_r_minor: number;
  KL_r: number;
  isTooSlenderForTension: boolean;
  isTooSlenderForCompression: boolean;
  L_b_ratio: number;


  axialCapacities(): MemberAxialCapacity;
  bendingCapacities(loading: MemberLoads): MemberBendingCapacity<T2, T3>;

  interactionCapacities(loading: MemberLoads): IDemandCapacities;
}

export class Member<
  T extends ISectionGeometry,
  T1 extends ISectionCompactnessElements,
  T2 extends ISectionBendingCapacityProps,
  T3 extends IBendingLTBProps
> implements IMember<T, T1, T2, T3> {

  // TODO: Should these all be readonly? Or should there be a way to independently change each one without needing to re-initialize?
  readonly loadsAtStations: { [key: number]: ISectionLoads };   // May change, unique to member
  readonly memberProperties: MemberProperties;    // May change, unique to member
  readonly section: Section<T, T1, T2, T3>;   // Consider referencing a GUID to fetch from a section store via a get method

  constructor(section: Section<T, T1, T2, T3>, memberGeometries: IMemberGeometries) {
    this.section = section;

    const memberGeometry: IMemberGeometries = new MemberGeometries(memberGeometries);
    this.memberProperties = new MemberProperties(memberGeometry);
  }

  get KL_r_major() {
    const { K, L_b } = this.memberProperties.majorBuckling;
    const { r_major } = this.section.geometry;

    return K * L_b / r_major;
  }

  get KL_r_minor() {
    const { K, L_b } = this.memberProperties.minorBuckling;
    const { r_minor } = this.section.geometry;

    return K * L_b / r_minor;
  }

  get KL_r() {
    return Math.max(this.KL_r_major, this.KL_r_minor);
  }

  // AISC D2
  get isTooSlenderForTension() {
    return this.KL_r > 300;
  }

  // AISC E2
  get isTooSlenderForCompression() {
    return this.KL_r > 200;
  }

  get L_b_ratio() {
    const { L_p, L_r } = this.section;
    const L_b = this.memberProperties.LTB.L_b;

    return (L_b - L_p) / (L_r - L_p);
  }

  private _F_e_LTB: F_e_LTB;
  get F_e_LTB(): F_e_LTB {
    if (!this._F_e_LTB) {
      const { E, G } = this.section.material;
      const { A_g, x_o, y_o, r_o_bar, H, C_w, J, I_minor, I_major } = this.section.geometry;
      const { L_cr: L_cr_LTB } = this.memberProperties.LTB;
      const { KL_r_major, KL_r_minor } = this;

      this._F_e_LTB = new F_e_LTB({
        E, G,
        A_g, x_o, y_o, r_o_bar, H, C_w, J, I_minor, I_major,
        L_cr_LTB, KL_r_major, KL_r_minor
      });
    }

    // TODO: Select F_e_LTB by section time - perhaps in another get method?
    return this._F_e_LTB;
  }

  axialCapacities() {
    if (this.isTooSlenderForCompression) {
      return;
    }

    const { E, G, F_y, F_u } = this.section.material;
    const { A_g, C_w, J, I_minor, I_major, sectionType, extentsWidth, extentsHeight } = this.section.geometry;
    const { hasCompressionLTB, A_effective } = this.section;
    const { L_cr: L_cr_LTB } = this.memberProperties.LTB;
    const { KL_r } = this;
    const F_e_LTB = this.F_e_LTB.getBy(sectionType, extentsWidth, extentsHeight);

    const capacities = new MemberAxialCapacity({
      hasCompressionLTB,
      E, G, F_y, F_u,
      A_g, A_effective,
      C_w, J, I_minor, I_major,
      L_cr_LTB,
      KL_r,
      F_e_LTB
    });

    return capacities;
  }

  bendingCapacities(loading: MemberLoads, C_b_isIgnored: boolean = false) {
    const sectionCapacities = this.section.bendingCapacities();

    this.memberProperties.setLoads(loading.LTB);
    const { K: K_LTB, L_b: L_b_LTB, } = this.memberProperties.LTB;
    const C_b = C_b_isIgnored ? 1 : this.memberProperties.C_b_major.C_b;
    const { L_b_ratio } = this;

    const capacities = new MemberBendingCapacity({
      sectionCapacities,
      K_LTB, L_b_LTB, L_b_ratio,
      C_b
    });

    return capacities;
  }

  interactionCapacities(loading: MemberLoads): IDemandCapacities {
    const capacity = this.getCapacities(loading);

    this.memberProperties.setLoads(loading.LTB);
    const C_b = this.memberProperties.C_b_major.C_b;

    const D_C: IDemandCapacities = new DemandCapacities();
    // TODO: Fallback - ensure all necessary loads are present,
    //    if not, use Loading class to generate them by interpolation/extrapolation
    // TODO: Consider if serialization is needed here
    for (const [station, loads] of Object.entries(loading)) {
      const demand = InteractionCapacity.getDemands(loads);
      D_C.stations[station] = new InteractionCapacity({ demand, capacity, C_b });
    }

    this.fillGoverningD_Cs(D_C);

    return D_C;
  }

  private getCapacities(loading: MemberLoads): ICapacityProps {
    const shearCapacities = this.section.shearCapacities();
    const sectionBendingCapacities = this.section.bendingCapacities();
    const memberBendingCapacities = this.bendingCapacities(loading);
    const memberBendingCapacitiesNoC_b = this.bendingCapacities(loading, true);

    // TODO: Currently the above generate a new object each time, which includes storing all intermediate properties
    //    Consider making them lazy-loading properties for drilling down
    //    Consider making return force objects of just the governing capacities or as needed below, with temp generated objects
    //    Consider LRFD vs. ASD, e.g. when to add in phi, since some cases (like shear) change it for some cases.
    //      Perhaps can use Factored_V_n_minor, for example, where this can use phi or 1/omega as appropriate

    const capacities: ICapacityProps = {
      P_c_compression: phi_c * this.axialCapacities().P_n_c,
      P_c_tension: this.section.axialCapacities().PhiP_n_t,
      V_c_minor: shearCapacities.phiV_n_minor,
      V_c_major: shearCapacities.phiV_n_major,
      // Double check these w/ CSI docs
      M_c_minor: phi_b * memberBendingCapacities.M_n_LTB,         // Governing overall
      M_n_minorSection: phi_b * sectionBendingCapacities.M_p_minor,  // Governing section?
      M_c_major: phi_b * memberBendingCapacities.M_n_LTB,         // Governing overall
      M_c_majorNoLTB: phi_b * sectionBendingCapacities.M_p_major,    // Governing section M
      M_c_major_C_b_1: phi_b * memberBendingCapacitiesNoC_b.M_n_LTB,     // LTB w/ Cb = 1
      T_c: 0,
    }

    return capacities;
  }

  private fillGoverningD_Cs(D_C: IDemandCapacities): IDemandCapacities {
    let governingPMM = null;
    let governingVMinor = null;
    let governingVMajor = null;

    for (const station of Object.values(D_C.stations)) {
      governingPMM = Math.max(
        governingPMM,
        station.D_C_BendingCompression.PMM,
        station.D_C_BendingCompression.InstabilityInPlane,
        station.D_C_BendingCompression.InstabilityOutOfPlane,
        station.D_C_BendingTension.TMM,
        station.D_C_BendingTension.InstabilityOutOfPlane
      );

      governingVMajor = Math.max(governingVMajor, station.D_C_V.major);
      governingVMinor = Math.max(governingVMinor, station.D_C_V.minor);
    }

    D_C.governing.PMM = governingPMM;
    D_C.governing.V_minor = governingVMinor;
    D_C.governing.V_major = governingVMajor;

    return D_C;
  }
}