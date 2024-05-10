import { render, screen } from '@testing-library/react';
import { LINK_RECORD_1, PROFILE_1, SERVICE_INFO_1 } from '../test/data';
import OverviewTab from './OverviewTab';

describe('The OverviewTab component', () => {
  it('renders appropriately for a regular user', async () => {
    const info = SERVICE_INFO_1;
    const linkRecord = LINK_RECORD_1;
    const profile = PROFILE_1;
    render(
      <OverviewTab info={info} linkRecord={linkRecord} profile={profile} />
    );

    const creditName = 'Foo B. Bar';
    const realName = 'Foo Bar';

    // Part of the profile should be available
    expect(await screen.findByText(creditName)).toBeVisible();
    expect(await screen.findByText(realName)).toBeVisible();
  });
});
