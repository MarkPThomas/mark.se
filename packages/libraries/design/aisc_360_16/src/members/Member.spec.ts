import { IMemberLoads, MemberLoads } from '../loading';
import { IMaterialProperties, Material } from '../materials/Material';
import { I_Section } from '../sections/I_Section/I_Section';
import { I_I_SectionGeometry, I_SectionGeometry } from '../sections/I_Section/I_SectionGeometry';
import { Member } from './Member';

describe('##Member', () => {
  it('should', () => {
    // Inputs
    const materialProps: IMaterialProperties = {
      name: 'Steel',
      E: 29000,
      F_y: 36,
      F_u: 45,
      mu: 0.2
    }

    const geometryProps: I_I_SectionGeometry = {
      d: 12,
      t_w: 1,
      t_f: 1,
      b_f: 6
    }

    const L: number = 1;

    const loadingProps: IMemberLoads = {
      '0': {
        axial: {
          compression: 0,
          tension: 0
        },
        shear: {
          major: 0,
          minor: 0
        },
        flexure: {
          positive: {
            major: 0,
            minor: 0
          },
          negative: {
            major: 0,
            minor: 0
          },
        },
        torsion: 0
      },
      '1': {
        axial: {
          compression: 0,
          tension: 0
        },
        shear: {
          major: 0,
          minor: 0
        },
        flexure: {
          positive: {
            major: 0,
            minor: 0
          },
          negative: {
            major: 0,
            minor: 0
          },
        },
        torsion: 0
      }
    }


    // Setup
    const material = new Material(materialProps);   // Object is just an intermediate to calculate props
    const geometry = new I_SectionGeometry(geometryProps);   // Object is just an intermediate to calculate props

    // TODO: Consider A_eff from I_Section w/ loads supplied upon initialization
    //    This is an optional property that should probably be handled differently?
    const section = new I_Section({ material, geometry }); // Update this to take material props & geometry props & generate internal classes
    const member = new Member(section, { L });

    const loading = new MemberLoads(loadingProps); // Consider having props or class for each FUT w/ fallback

    // Test
    const bendingCapacities = member.bendingCapacities(loading); // One test
    expect(bendingCapacities).toEqual(null);

    const demandCapacities = member.interactionCapacities(loading); // Another test
    expect(demandCapacities).toEqual(null);

  });
})