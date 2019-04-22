import { expect } from 'chai';
import { set } from 'lodash/fp';

import reducer from '../../reducers';
import { calculatorConstants } from '../gibct-helpers';
import createCommonStore from 'platform/startup/store';
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
  it('should estimate zero tuition allowance for ojt school', () => {
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
