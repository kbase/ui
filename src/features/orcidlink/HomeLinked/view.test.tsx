import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LINK_RECORD_1, PROFILE_1, SERVICE_INFO_1 } from '../test/data';
import HomeLinked from './view';

describe('The HomeLinked Component', () => {
  it('renders with minimal props', async () => {
    const info = SERVICE_INFO_1;
    const linkRecord = LINK_RECORD_1;
    const profile = PROFILE_1;

    render(
      <HomeLinked info={info} linkRecord={linkRecord} profile={profile} />
    );

    const creditName = 'Foo B. Bar';
    const realName = 'Foo Bar';

    // Part of the profile should be available
    expect(await screen.findByText(creditName)).toBeVisible();
    expect(await screen.findByText(realName)).toBeVisible();
  });

  it('tab content switches when tabs are selected', async () => {
    const info = SERVICE_INFO_1;
    const linkRecord = LINK_RECORD_1;
    const profile = PROFILE_1;

    render(
      <MemoryRouter initialEntries={['/foo']}>
        <HomeLinked info={info} linkRecord={linkRecord} profile={profile} />
      </MemoryRouter>
    );

    const creditName = 'Foo B. Bar';
    const realName = 'Foo Bar';

    const overviewAreaTitle = 'Your KBase ORCID Link';
    const removeAreaTitle = 'Remove your KBase ORCID® Link';

    const overviewTabLabel = 'Overview';
    const manageTabLabel = 'Manage Your Link';

    const overviewTab = await screen.findByText(overviewTabLabel);
    const manageTab = await screen.findByText(manageTabLabel);

    // Part of the profile should be available on initial tab.
    expect(await screen.findByText(creditName)).toBeVisible();
    expect(await screen.findByText(realName)).toBeVisible();

    act(() => {
      manageTab.click();
    });

    waitFor(async () => {
      expect(await screen.findByText(removeAreaTitle)).toBeVisible();
    });

    act(() => {
      overviewTab.click();
    });

    waitFor(async () => {
      expect(await screen.findByText(overviewAreaTitle)).toBeVisible();
    });
  });
});
