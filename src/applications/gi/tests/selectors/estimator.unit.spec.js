import { expect } from 'chai';
import { set } from 'lodash/fp';

import reducer from '../../reducers';
import { calculatorConstants } from '../gibct-helpers';
import createCommonStore from 'platform/startup/store';
import environment from 'platform/utilities/environment';
import { estimatedBenefits } from '../../selectors/estimator';

const defaultState = createCommonStore(reducer).getState();

defaultState.constants = {
  constants: {},
  version: calculatorConstants.meta.version,
  inProgress: false,
};

calculatorConstants.data.forEach(c => {
  defaultState.constants.constants[c.attributes.name] = c.attributes.value;
});

describe('estimatedBenefits', () => {
  // Colmery 501 specific tests which will fail in production
  if (!environment.isProduction()) {
    it('lower DoD rate than VA should result in DoD rate displaying', () => {
      expect(
        estimatedBenefits(defaultState, {
          bah: 1000,
          dodBah: 500,
          country: 'usa',
        }).housing.value,
      ).to.equal(500);
    });

    it('lower VA rate than DoD should result in VA rate displaying', () => {
      expect(
        estimatedBenefits(defaultState, {
          bah: 1000,
          dodBah: 5000,
          country: 'usa',
        }).housing.value,
      ).to.equal(1000);
    });

    it('should estimate housing for purple heart benefit', () => {
      const state = set(
        'eligibility.cululativeService',
        'purple heart',
        defaultState,
      );
      expect(
        estimatedBenefits(state, { type: 'public', bah: 2000, country: 'usa' })
          .housing.value,
      ).to.equal(2000);
    });

    it('should estimate books for purple heart benefit', () => {
      const state = set(
        'eligibility.cululativeService',
        'purple heart',
        defaultState,
      );
      expect(
        estimatedBenefits(state, { type: 'public', country: 'usa' }).books
          .value,
      ).to.equal(1000);
    });

    it('should display 1/2 lower DoD average rate for online classes', () => {
      let state = set('constants.constants.AVGDODBAH', 500, defaultState);
      state = set('eligibility.onlineClasses', 'yes', state);
      expect(
        estimatedBenefits(state, { type: 'public', country: 'usa' }).housing
          .value,
      ).to.equal(250);
    });

    it('should display 1/2 lower VA average rate for online classes for usa institutions', () => {
      const state = set('eligibility.onlineClasses', 'yes', defaultState);
      expect(
        estimatedBenefits(state, { type: 'public', country: 'usa' }).housing
          .value,
      ).to.equal(806);
    });

    it('should display 1/2 lower VA average rate for online classes for non-usa institutions', () => {
      const state = set('eligibility.onlineClasses', 'yes', defaultState);
      expect(
        estimatedBenefits(state, { type: 'public', country: 'canada' }).housing
          .value,
      ).to.equal(806);
    });

    it('should display lower DoD average rate for non-usa institutions', () => {
      const state = set('constants.constants.AVGDODBAH', 500, defaultState);
      expect(
        estimatedBenefits(state, { type: 'public', country: 'canada' }).housing
          .value,
      ).to.equal(500);
    });

    it('should display lower VA average rate for non-usa institutions', () => {
      expect(
        estimatedBenefits(defaultState, { type: 'public', country: 'canada' })
          .housing.value,
      ).to.equal(1611);
    });
  }

  it('should estimate zero tuition allowance for OJT school', () => {
    expect(
      estimatedBenefits(defaultState, {
        type: 'ojt',
        bah: 1000,
        country: 'usa',
      }).tuition.value,
    ).to.equal('N/A');
  });

  it('should estimate zero housing allowance for active duty', () => {
    const state = set(
      'eligibility.militaryStatus',
      'active duty',
      defaultState,
    );

    expect(
      estimatedBenefits(state, {
        type: 'public school',
        bah: 1000,
        country: 'usa',
      }).housing.value,
    ).to.equal(0);
  });

  it('should estimate zero housing allowance for active duty spouse', () => {
    let state = set('eligibility.militaryStatus', 'spouse', defaultState);
    state = set('eligibility.spouseActiveDuty', 'yes', state);

    expect(
      estimatedBenefits(state, {
        type: 'public school',
        bah: 1000,
        country: 'usa',
      }).housing.value,
    ).to.equal(0);
  });

  it('should estimate zero housing allowance for correspondence school', () => {
    expect(
      estimatedBenefits(defaultState, {
        type: 'correspondence',
        bah: 1000,
        country: 'usa',
      }).housing.value,
    ).to.equal(0);
  });

  it('should estimate zero tuition allowance for old GI bill', () => {
    const state = set('eligibility.giBillChapter', '30', defaultState);
    expect(
      estimatedBenefits(state, {
        type: 'public school',
        bah: 1000,
        country: 'usa',
      }).tuition.value,
    ).to.equal(0);
  });

  it('should estimate housing allowance for chapter 30 as MGIB3YRRATE', () => {
    const state = set('eligibility.giBillChapter', '30', defaultState);
    expect(
      estimatedBenefits(state, {
        type: 'public school',
        bah: 1000,
        country: 'usa',
      }).housing.value,
    ).to.equal(Math.round(state.constants.constants.MGIB3YRRATE));
  });

  it('should estimate OJT housing allowance for chapter 30 as .75 * MGIB3YRRATE', () => {
    const state = set('eligibility.giBillChapter', '30', defaultState);
    expect(
      estimatedBenefits(state, {
        type: 'ojt',
        bah: 1000,
        country: 'usa',
      }).housing.value,
    ).to.equal(Math.round(state.constants.constants.MGIB3YRRATE * 0.75));
  });
});
