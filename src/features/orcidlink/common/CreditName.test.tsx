import { render } from '@testing-library/react';
import 'core-js/stable/structured-clone';
import { ORCIDProfile } from '../../../common/api/orcidLinkCommon';
import { PROFILE_1 } from '../test/data';
import CreditName from './CreditName';

describe('The renderCreditName render function', () => {
  it('renders correctly if not private', () => {
    const profile = structuredClone<ORCIDProfile>(PROFILE_1);

    const { container } = render(<CreditName profile={profile} />);

    expect(container).toHaveTextContent('Foo B. Bar');
  });

  it('renders a special string if it is private', () => {
    const profile = structuredClone<ORCIDProfile>(PROFILE_1);

    profile.nameGroup.private = true;

    const { container } = render(<CreditName profile={profile} />);

    expect(container).toHaveTextContent('private');
  });

  it('renders a "not available" string if it is absent', () => {
    const profile = structuredClone<ORCIDProfile>(PROFILE_1);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    profile.nameGroup.fields!.creditName = null;

    const { container } = render(<CreditName profile={profile} />);

    expect(container).toHaveTextContent('n/a');
  });
});
