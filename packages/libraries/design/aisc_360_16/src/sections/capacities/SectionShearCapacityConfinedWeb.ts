import { ISectionShearCapacity, ISectionShearCapacityProps, SectionShearCapacity } from "./SectionShearCapacity";

export interface ISectionShearCapacityConfinedWebProps extends ISectionShearCapacityProps {
  isWelded: boolean;
}

export interface ISectionShearCapacityConfinedWeb extends ISectionShearCapacity {
  C_v1: number;
}

export class SectionShearCapacityConfinedWeb
  extends SectionShearCapacity<ISectionShearCapacityConfinedWebProps>
  implements ISectionShearCapacityConfinedWeb {

  constructor(props: ISectionShearCapacityConfinedWebProps) {
    super(props);
  }

  protected isWebRolledAndCompactInShear() {
    const { isWelded, web } = this._props;

    return !isWelded && web.isCompact();
  }

  // AISC G2-2, G2-3, G2-4
  // I, C, CC majors
  get C_v1() {
    const { web } = this._props;

    return (this.isWebRolledAndCompactInShear() || web.isNonCompact()) ? 1 : web.nonCompactLimit() / web.lambda;
  }

  // AISC G2-1
  override get V_n_major() {
    const { F_y, A_v_major } = this._props;

    return 0.6 * F_y * A_v_major * this.C_v1;
  }
}