import { render } from '@testing-library/react';
import 'core-js/actual/structured-clone';
import { ORCIDProfile } from '../../../common/api/orcidLinkCommon';
import { PROFILE_1 } from '../test/data';
import RealName from './RealName';

describe('the renderRealName render function ', () => {
  it('renders correctly if not private', () => {
    const profile = structuredClone<ORCIDProfile>(PROFILE_1);

    const { container } = render(<RealName profile={profile} />);

    expect(container).toHaveTextContent('Foo Bar');
  });

  it('renders just the first name if no last name', () => {
    const profile = structuredClone<ORCIDProfile>(PROFILE_1);

    // We know how the test profile is populated.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    profile.nameGroup.fields!.lastName = null;

    const { container } = render(<RealName profile={profile} />);

    expect(container).toHaveTextContent('Foo');
  });

  it('renders a special string if it is private', () => {
    const profile = structuredClone<ORCIDProfile>(PROFILE_1);
    profile.nameGroup.private = true;

    const { container } = render(<RealName profile={profile} />);

    expect(container).toHaveTextContent('private');
  });
});
