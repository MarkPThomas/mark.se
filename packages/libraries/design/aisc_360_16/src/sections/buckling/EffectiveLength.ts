export interface IEffectiveLength {
  b: number;
  c_1: number;
  c_2: number;

  F_el(nonCompactLimit: number): number;
  b_e(F_cr: number, nonCompactRatioLimit: number): number;
}

export enum eSlenderElement {
  HSS_Wall,
  Stiffened,
  Unstiffened
}

export class EffectiveLength implements IEffectiveLength {
  readonly F_y: number;
  readonly b: number;
  readonly aspectRatio: number;

  // AISC Table E7.1
  readonly slenderElement: eSlenderElement;
  // Effective width imperfection adjustment factor
  get c_1(): number {
    switch (this.slenderElement) {
      case eSlenderElement.HSS_Wall:
        return 0.18;
      case eSlenderElement.Stiffened:
        return 0.20;
      case eSlenderElement.Unstiffened:
        return 0.22;
    }
  }

  // AISC Table E7.1
  get c_2(): number {
    return (1 - Math.sqrt(1 - 4 * this.c_1)) / (2 * this.c_1);
  }

  constructor(F_y: number, b: number, aspectRatio: number, slenderElement: eSlenderElement) {
    this.F_y = F_y;
    this.b = b;
    this.aspectRatio = aspectRatio;
    this.slenderElement = slenderElement;
  }

  // AISC E7-5
  // Elastic Local Buckling Stress
  F_el(nonCompactRatioLimit: number): number {
    return this.F_y * (this.c_2 * nonCompactRatioLimit / this.aspectRatio) ** 2;
  }

  // AISC E7-2, E7-3
  b_e(F_cr: number, nonCompactRatioLimit: number): number {
    const aspectRatioLimit = nonCompactRatioLimit * Math.sqrt(this.F_y / F_cr);

    let effectiveLengthFactor = 1;
    if (this.aspectRatio >= aspectRatioLimit) {
      const F_el = this.F_el(nonCompactRatioLimit);
      const bucklingStressRatio = Math.sqrt(F_el / F_cr);
      effectiveLengthFactor = (1 - this.c_1 * bucklingStressRatio) * bucklingStressRatio;
    }

    return this.b * effectiveLengthFactor;
  }
}