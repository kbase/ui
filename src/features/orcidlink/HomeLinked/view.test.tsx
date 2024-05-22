import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LINK_RECORD_1, PROFILE_1, SERVICE_INFO_1 } from '../test/data';
import { noop } from '../test/mocks';
import HomeLinked from './view';

describe('The HomeLinked Component', () => {
  let debugLogSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.resetAllMocks();
  });
  beforeEach(() => {
    debugLogSpy = jest.spyOn(console, 'debug');
  });

  it('renders with minimal props', async () => {
    const info = SERVICE_INFO_1;
    const linkRecord = LINK_RECORD_1;
    const profile = PROFILE_1;

    render(
      <HomeLinked
        info={info}
        linkRecord={linkRecord}
        profile={profile}
        removeLink={noop}
        toggleShowInProfile={noop}
      />
    );

    const creditName = 'Foo B. Bar';
    const realName = 'Foo Bar';

    // The profile fields should be displayed.
    expect(await screen.findByText(creditName)).toBeVisible();
    expect(await screen.findByText(realName)).toBeVisible();
  });

  it('tab content switches when tabs are selected', async () => {
    const user = userEvent.setup();
    const info = SERVICE_INFO_1;
    const linkRecord = LINK_RECORD_1;
    const profile = PROFILE_1;
    render(
      <MemoryRouter initialEntries={['/foo']}>
        <HomeLinked
          info={info}
          linkRecord={linkRecord}
          profile={profile}
          removeLink={noop}
          toggleShowInProfile={noop}
        />
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

    await user.click(manageTab);

    waitFor(async () => {
      expect(await screen.findByText(removeAreaTitle)).toBeVisible();
    });

    await user.click(overviewTab);

    waitFor(async () => {
      expect(await screen.findByText(overviewAreaTitle)).toBeVisible();
    });
  });

  it('"show in user profile" toggle calls the function passed down to it', async () => {
    const user = userEvent.setup();
    const info = SERVICE_INFO_1;
    const linkRecord = LINK_RECORD_1;
    const profile = PROFILE_1;

    const toggleShowInProfile = () => {
      // eslint-disable-next-line no-console
      console.debug('TOGGLE SHOW IN PROFILE');
    };

    render(
      <MemoryRouter initialEntries={['/foo']}>
        <HomeLinked
          info={info}
          linkRecord={linkRecord}
          profile={profile}
          removeLink={noop}
          toggleShowInProfile={toggleShowInProfile}
        />
      </MemoryRouter>
    );

    const creditName = 'Foo B. Bar';
    const removeAreaTitle = 'Remove your KBase ORCID® Link';
    const manageTabLabel = 'Manage Your Link';

    const manageTab = await screen.findByText(manageTabLabel);

    // Part of the profile should be available on initial tab.
    expect(await screen.findByText(creditName)).toBeVisible();

    // Now select the manage tab
    await user.click(manageTab);

    waitFor(async () => {
      expect(await screen.findByText(removeAreaTitle)).toBeVisible();
    });

    // And finally, click the toggle
    const toggleControl = await screen.findByText('Yes');

    await user.click(toggleControl);

    await waitFor(() => {
      expect(debugLogSpy).toHaveBeenCalledWith('TOGGLE SHOW IN PROFILE');
    });
  });
});
