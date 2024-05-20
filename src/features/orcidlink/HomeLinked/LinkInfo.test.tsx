import { render } from '@testing-library/react';
import { LINK_RECORD_1, PROFILE_1 } from '../test/data';
import LinkInfo from './LinkInfo';

describe('The LinkInfo component', () => {
  it('renders normally', () => {
    const linkRecord = LINK_RECORD_1;

    const profile = PROFILE_1;
    const orcidSiteURL = 'foo';

    const { container } = render(
      <LinkInfo
        linkRecord={linkRecord}
        profile={profile}
        orcidSiteURL={orcidSiteURL}
      />
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(container).toHaveTextContent(profile.nameGroup.fields!.creditName!);
  });
});
