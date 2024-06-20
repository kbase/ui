import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'jest-fetch-mock';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createTestStore } from '../../app/store';
import MainView from './index';
import { INITIAL_STORE_STATE } from './test/data';
import { setupMockRegularUser } from './test/mocks';

describe('The Main Component', () => {
  let debugLogSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.resetAllMocks();
  });
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.enableMocks();
    debugLogSpy = jest.spyOn(console, 'debug');
  });

  it('renders with minimal props', async () => {
    setupMockRegularUser();

    render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/orcidlink']}>
          <Routes>
            <Route path={'orcidlink'} element={<MainView />} />
          </Routes>
          {/* <CreateLinkIndex /> */}
        </MemoryRouter>
      </Provider>
    );

    const creditName = 'Foo B. Bar';
    const realName = 'Foo Bar';

    // Part of the profile should be available
    expect(await screen.findByText(creditName)).toBeVisible();
    expect(await screen.findByText(realName)).toBeVisible();
  });

  it('can switch to the "manage your link" tab', async () => {
    const user = userEvent.setup();
    setupMockRegularUser();

    render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/orcidlink']}>
          <Routes>
            <Route path={'orcidlink'} element={<MainView />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Matches test data (see the setup function above)
    const creditName = 'Foo B. Bar';
    // Matches what would be synthesized from the test data
    const realName = 'Foo Bar';

    // Part of the profile should be available
    expect(await screen.findByText(creditName)).toBeVisible();
    expect(await screen.findByText(realName)).toBeVisible();

    const tab = await screen.findByText('Manage Your Link');
    expect(tab).not.toBeNull();

    await user.click(tab);

    await waitFor(() => {
      expect(
        screen.queryByText('Remove your KBase ORCID® Link')
      ).not.toBeNull();
      expect(screen.queryByText('Settings')).not.toBeNull();
    });
  });

  it('the "Show in User Profile?" switch calls the prop function we pass', async () => {
    const user = userEvent.setup();
    setupMockRegularUser();

    render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/orcidlink']}>
          <Routes>
            <Route path={'orcidlink'} element={<MainView />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    const tab = await screen.findByText('Manage Your Link');
    expect(tab).not.toBeNull();
    await user.click(tab);

    await waitFor(() => {
      expect(screen.queryByText('Settings')).not.toBeNull();
    });

    const toggleControl = await screen.findByText('Yes');

    await user.click(toggleControl);

    await waitFor(() => {
      expect(debugLogSpy).toHaveBeenCalledWith('TOGGLE SHOW IN PROFILE');
    });
  });
});
