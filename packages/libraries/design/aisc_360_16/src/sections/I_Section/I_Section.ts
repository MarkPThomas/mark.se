import { ISection, ISectionProps, Section } from "../Section";
import { WeldedFactors } from "../buckling/WeldedFactors";
import { EffectiveLength, eSlenderElement } from "../buckling/EffectiveLength";
import {
  eCompactness,
  ShearCompactness,
  ElementCompactnessSet,
  ISectionCompactnessElements,
  SectionCompactness
} from "../buckling/compactness";

import { FlangeCompactnessSet } from "./compactness/FlangeCompactness";
import {
  WebCompactnessFlexureMajor,
  WebCompactnessSet,
} from "./compactness/WebCompactness";
import { I_I_SectionGeometry } from "./I_SectionGeometry";
import { SectionAxialCapacity } from "../capacities/SectionAxialCapacity";
import { BendingCapacity } from "./capacities/BendingCapacity";
import { ShearCapacity } from "./capacities/ShearCapacity";
import { ISectionBendingCapacityProps, IBendingLTBProps } from "../capacities";



// TODO: See if singly- vs. doubly-symmetric sections can use this same class
// Differentiated by supplied properties (different bottom flange props)

export interface I_I_SectionCompactnessElements extends ISectionCompactnessElements {
  flange: ElementCompactnessSet;
}

export interface I_I_SectionProps extends ISectionProps<I_I_SectionGeometry> {
  isWelded?: boolean;
}

export interface I_I_Section extends ISection<
  I_I_SectionGeometry,
  I_I_SectionCompactnessElements,
  ISectionBendingCapacityProps,
  IBendingLTBProps> {

  isWelded: boolean;
  weldedFactors: WeldedFactors;
}

export class I_Section extends Section<
  I_I_SectionGeometry,
  I_I_SectionCompactnessElements,
  ISectionBendingCapacityProps,
  IBendingLTBProps
> implements I_I_Section {


  protected constructSectionCompactness(): void {
    const { E, F_y } = this.material;

    const flangeLength = this.geometry.b_f / 2;
    const flangeThickness = this.geometry.t_f;
    const builtUpFactors = this.weldedFactors;
    const flangeCompactnesses = new FlangeCompactnessSet({
      E, F_y,
      length: flangeLength,
      thickness: flangeThickness,
      builtUpFactors
    });

    const webLength = this.geometry.h_c;
    const webThickness = this.geometry.t_w;
    const frameType = this.frameType;
    const webCompactnesses = new WebCompactnessSet({
      E, F_y,
      length: webLength,
      thickness: webThickness,
      frameType
    });

    const elements: I_I_SectionCompactnessElements = {
      web: webCompactnesses,
      flange: flangeCompactnesses
    }

    this._compactness = new SectionCompactness(elements);
  }

  protected get _webCompactness() {
    return this._compactness.elements.web;
  }

  protected get _flangeCompactness() {
    return this._compactness.elements.flange;
  }

  readonly isWelded: boolean;
  readonly weldedFactors: WeldedFactors;

  // AISC F4-11
  get r_t_prime(): number {
    switch (this._webCompactness.flexureMajor.classification) {
      case eCompactness.compact:
        return this.geometry.r_ts ?? 1;
      case eCompactness.nonCompact:
        return this.geometry.r_t ?? 1;
      default:
        return 1;
    }
  }

  // AISC F2-8a, F4-2
  get C_prime(): number {
    const { c_compact, C_nonCompact } = this.geometry;

    return this._webCompactness.flexureMajor.isCompact() ? c_compact : C_nonCompact;
  }

  // AISC F2-5, F4-7, F5-2
  get L_p(): number {
    const { E, F_y } = this.material;
    const { r_minor, r_t } = this.geometry;

    return this._webCompactness.flexureMajor.isCompact()
      ? 1.76 * r_minor * Math.sqrt(E / F_y)
      : 1.1 * r_t * Math.sqrt(E / F_y);
  }

  // AISC F2-6, F4-8, F5-5
  get L_r(): number {
    const { E } = this.material;
    const { F_L } = this.weldedFactors;
    const { r_t, J, c_compact, S_positive_minor, h_o } = this.geometry;

    return this._webCompactness.flexureMajor.isSlender()
      ? Math.PI * r_t * Math.sqrt(E / F_L)
      : 1.95 * this.r_t_prime * (E / F_L)
      * Math.sqrt(J * c_compact / (S_positive_minor * h_o))
      * Math.sqrt(1 + Math.sqrt(1 + 6.76 * ((F_L / E) * S_positive_minor * h_o / (J * c_compact)) ** 2));
  }

  constructor(props: I_I_SectionProps) {
    super({ ...props, hasCompressionLTB: true });

    this.isWelded = props.isWelded ?? false;

    const { F_y } = this.material;
    const { h, t_w, S_positive_major: S_majorPositive, S_negative_major: S_majorNegative } = this.geometry;
    this.weldedFactors = new WeldedFactors({ F_y, h, t_w, S_majorPositive, S_majorNegative });
  }

  private nonCompact_flangeLimit(): number {
    if (this.loads?.flexure) {
      return this._flangeCompactness.flexureMajor.nonCompactLimit();
    } else {
      return this._flangeCompactness.axialCompression.nonCompactLimit();
    }
  }

  private nonCompact_webLimit(): number {
    if (this.loads?.flexure) {
      return this._webCompactness.flexureMajor.nonCompactLimit();
    } else {
      return this._webCompactness.axialCompression.nonCompactLimit();
    }
  }

  // AISC E7-1
  A_effective(F_cr: number): number {
    const { A_g, t_f, t_w, b_flange, b_web } = this.geometry;
    const { F_y } = this.material;

    const flangeEffectiveLength = new EffectiveLength(
      F_y,
      b_flange,
      this._flangeCompactness.lambda,
      eSlenderElement.Unstiffened
    );

    const b_e_flange = flangeEffectiveLength.b_e(F_cr, this.nonCompact_flangeLimit());

    const webEffectiveLength = new EffectiveLength(
      F_y,
      b_web,
      this._webCompactness.lambda,
      eSlenderElement.Stiffened
    );

    const b_e_web = webEffectiveLength.b_e(F_cr, this.nonCompact_webLimit());

    // AISC E7-1
    return A_g - (4 * (b_flange - b_e_flange) * t_f + (b_web - b_e_web) * t_w);
  }

  // TODO: Lazy load property?
  axialCapacities() {
    const { F_y, F_u } = this.material;
    const { A_g, A_net } = this.geometry;
    const capacities = new SectionAxialCapacity({ F_y, F_u, A_g, A_net });

    return capacities;
  }

  // TODO: Lazy load property?
  bendingCapacities() {
    const { E, G, F_y } = this.material;
    const {
      I_c__I_major: I_c_I_major, I_minor, I_major,
      S_positive_major, S_positive_minor,
      Z_positive_major, Z_positive_minor,
      a_w, h_o, t_w,
      r_major, r_minor, r_t, r_ts, c_compact, C_nonCompact, C_w, J } = this.geometry;
    const { F_L, k_c } = this.weldedFactors;
    const web = this._webCompactness.flexureMajor as WebCompactnessFlexureMajor;
    const flange = this._flangeCompactness.flexureMajor;
    const { isWelded, L_p, L_r, C_prime, r_t_prime } = this;

    const capacities = new BendingCapacity({
      E, F_y, G, F_L, k_c, isWelded,
      I_c_I_major, I_minor, I_major,
      S_positive_major, S_positive_minor,
      Z_positive_major, Z_positive_minor,
      a_w, h_o, t_w,
      r_min: Math.min(r_major, r_minor),
      r_t, r_ts, c_compact, C_nonCompact, C_w, J,
      C_prime, r_t_prime,
      web, flange,
      L_p, L_r
    });

    return capacities;
  }

  // TODO: Lazy load property
  shearCapacities() {
    const { E, F_y, F_u } = this.material;
    const { A_v_major, A_v_minor } = this.geometry;
    const isWelded = this.isWelded;
    const web = this._webCompactness.shearMajor as ShearCompactness;
    const flange = this._flangeCompactness.shearMinor as ShearCompactness;

    const capacities = new ShearCapacity({ E, F_y, F_u, A_v_major, A_v_minor, web, flange, isWelded });

    return capacities;
  }
}

