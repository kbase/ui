import { render, screen } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createTestStore } from '../../app/store';
import { MfaStatus } from '../../common/types/auth';
import { TokenInfo } from '../auth/authSlice';
import LeftNavBar from './LeftNavBar';

const renderNav = (customroles: string[], mfa: MfaStatus) => {
  fetchMock.mockResponse(async (req) => {
    if (req.url.includes('/api/V2/me'))
      return JSON.stringify({ user: 'someuser', roles: [], customroles });
    return JSON.stringify({ unseen: { global: 0, user: 0 } });
  });
  const store = createTestStore({
    auth: {
      initialized: true,
      token: 'sometoken',
      username: 'someuser',
      tokenInfo: { mfa } as TokenInfo,
    },
  });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <LeftNavBar />
      </MemoryRouter>
    </Provider>
  );
};

describe('LeftNavBar Lakehouse item', () => {
  beforeEach(() => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();
  });
  afterEach(() => {
    fetchMock.disableMocks();
  });

  test('is absent without the BERDL_USER role', async () => {
    renderNav([], 'Used');
    await screen.findByText('Navigator');
    expect(screen.queryByText('Lakehouse')).not.toBeInTheDocument();
  });

  test('links to the hub redirect for an MFA log in session', async () => {
    renderNav(['BERDL_USER'], 'Used');
    const item = await screen.findByText('Lakehouse');
    expect(item.closest('a')).toHaveAttribute('href', '/lakehouse/redirect');
    expect(screen.queryByText('alpha')).not.toBeInTheDocument();
  });

  test.each<MfaStatus>(['NotUsed', 'Unknown'])(
    'is disabled for a %s log in session',
    async (mfa) => {
      renderNav(['BERDL_USER'], mfa);
      const item = await screen.findByText('Lakehouse');
      expect(item.closest('a')).toBeNull();
      expect(item.closest('[aria-disabled="true"]')).not.toBeNull();
    }
  );
});
