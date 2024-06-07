import { ISectionLoads } from "../../../loading";
import { eCompactness } from "./Compactness";
import { ElementCompactnessSet } from "./ElementCompactnessSet";


export interface ISectionCompactnessElements {
  web: ElementCompactnessSet;
}

export interface ISectionCompactness<T extends ISectionCompactnessElements> {
  elements: T;

  compression(): eCompactness;
  flexureMajor(): eCompactness;
  flexureMinor(): eCompactness;
  shearMajor(): eCompactness;
  shearMinor(): eCompactness;
  byLoads(loads: ISectionLoads): eCompactness;
}

export class SectionCompactness<T extends ISectionCompactnessElements>
  implements ISectionCompactness<T> {
  readonly elements: T;

  constructor(elements: T) {
    this.elements = elements;
  }

  compression(): eCompactness {
    let sectionClass = -Infinity;

    for (const element of Object.values(this.elements)) {
      sectionClass = Math.max(sectionClass, element.axialCompression?.compactness());
    };

    return sectionClass;
  }

  flexureMajor(): eCompactness {
    let sectionClass = -Infinity;

    for (const element of Object.values(this.elements)) {
      sectionClass = Math.max(sectionClass, element.flexureMajor?.compactness());
    };

    return sectionClass;
  }

  flexureMinor(): eCompactness {
    let sectionClass = -Infinity;

    for (const element of Object.values(this.elements)) {
      sectionClass = Math.max(sectionClass, element.flexureMinor?.compactness());
    };

    return sectionClass;
  }

  shearMajor(): eCompactness {
    let sectionClass = -Infinity;

    for (const element of Object.values(this.elements)) {
      sectionClass = Math.max(sectionClass, element.shearMajor?.compactness());
    };

    return sectionClass;
  }

  shearMinor(): eCompactness {
    let sectionClass = -Infinity;

    for (const element of Object.values(this.elements)) {
      sectionClass = Math.max(sectionClass, element.shearMinor?.compactness());
    };

    return sectionClass;
  }

  // TODO: Check max of null vs. Infinity or other values
  byLoads(loads: ISectionLoads): eCompactness {
    let sectionClass = -Infinity;

    if (loads.flexure) {
      if (loads.flexure.positive?.major || loads.flexure.negative?.major) {
        sectionClass = Math.max(sectionClass, this.flexureMajor());
      }

      if (loads.flexure.positive?.minor || loads.flexure.negative?.minor) {
        sectionClass = Math.max(sectionClass, this.flexureMinor());
      }
    } else {
      sectionClass = Math.max(sectionClass, this.compression());
    }

    return sectionClass;
  }
}