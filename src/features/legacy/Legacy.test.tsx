import { render, screen, waitFor } from '@testing-library/react';
import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import {
  MemoryRouter as Router,
  Route,
  Routes as RRRoutes,
  useLocation,
} from 'react-router-dom';
import { vi } from 'vitest';
import { createTestStore } from '../../app/store';
import * as authHooks from '../auth/hooks';
import * as layoutSlice from '../layout/layoutSlice';
import Legacy, {
  formatLegacyUrl,
  getLegacyPart,
  isLoginMessage,
  isLogoutMessage,
  isRouteMessage,
  isTitleMessage,
  LEGACY_BASE_ROUTE,
  useMessageListener,
} from './Legacy';

const setupMessageListener = () => {
  const spy = vi.fn();
  const Component = () => {
    const ref = useRef<HTMLIFrameElement>(null);
    useMessageListener(ref, spy);
    return <iframe ref={ref} title="iframe" />;
  };
  render(<Component />);
  return spy;
};

const titleMessage = { source: 'kbase-ui.ui.setTitle', payload: 'fooTitle' };
const routeMessage = {
  source: 'kbase-ui.app.route-component',
  payload: { request: { original: '#/some/hash/path' } },
};
const loginMessage = {
  source: 'kbase-ui.session.loggedin',
  payload: { token: 'some-token' },
};
const logoutMessage = {
  source: 'kbase-ui.session.loggedout',
  payload: undefined,
};
const nullLoginMessage = {
  source: 'kbase-ui.session.loggedin',
  payload: { token: null },
};

describe('Legacy', () => {
  test('useMessageListener listens', async () => {
    const spy = setupMessageListener();
    window.postMessage('foo', '*');
    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });
  });

  test('useMessageListener ignores non-target source when MODE is development', async () => {
    const originalMode = import.meta.env.MODE;
    (import.meta.env as Record<string, string>).MODE = 'development';
    const spy = setupMessageListener();
    window.postMessage('foo', '*');
    await waitFor(() => {
      expect(spy).not.toHaveBeenCalled();
    });
    (import.meta.env as Record<string, string>).MODE = originalMode;
  });

  test('isTitleMessage', () => {
    expect(isTitleMessage(titleMessage)).toBe(true);
    expect(isTitleMessage(routeMessage)).toBe(false);
    expect(isTitleMessage(loginMessage)).toBe(false);
    expect(isTitleMessage(nullLoginMessage)).toBe(false);
  });

  test('isRouteMessage', () => {
    expect(isRouteMessage(titleMessage)).toBe(false);
    expect(isRouteMessage(routeMessage)).toBe(true);
    expect(isRouteMessage(loginMessage)).toBe(false);
    expect(isRouteMessage(nullLoginMessage)).toBe(false);
  });

  test('isLoginMessage', () => {
    expect(isLoginMessage(titleMessage)).toBe(false);
    expect(isLoginMessage(routeMessage)).toBe(false);
    expect(isLoginMessage(loginMessage)).toBe(true);
    expect(isLoginMessage(nullLoginMessage)).toBe(true);
  });

  test('isLogoutMessage', () => {
    expect(isLogoutMessage(titleMessage)).toBe(false);
    expect(isLogoutMessage(routeMessage)).toBe(false);
    expect(isLogoutMessage(loginMessage)).toBe(false);
    expect(isLogoutMessage(nullLoginMessage)).toBe(false);
    expect(isLogoutMessage(logoutMessage)).toBe(true);
  });

  test('getLegacyPart', () => {
    expect(getLegacyPart('/legacy/foo/bar')).toBe('foo/bar');
    expect(getLegacyPart('ci.kbase.us/some-path/legacy/foo/bar')).toBe(
      'foo/bar'
    );
    expect(getLegacyPart('ci.kbase.us/legacy/foo/bar/')).toBe('foo/bar/');
    expect(getLegacyPart('/legacy/')).toBe('/');
    expect(getLegacyPart('/legacy')).toBe('/');
  });

  test('formatLegacyUrl', () => {
    expect(formatLegacyUrl('foo/bar/')).toBe(
      `https://${import.meta.env.VITE_KBASE_LEGACY_DOMAIN}/#foo/bar/`
    );
    expect(formatLegacyUrl('/foo/bar/')).toBe(
      `https://${import.meta.env.VITE_KBASE_LEGACY_DOMAIN}/#/foo/bar/`
    );
  });

  test('Legacy page component renders and navigates', async () => {
    const locationSpy = vi.fn();
    const TestWrapper = () => {
      const location = useLocation();
      useEffect(() => locationSpy(location), [location]);
      return <Legacy />;
    };
    render(
      <Provider store={createTestStore()}>
        <Router initialEntries={[LEGACY_BASE_ROUTE]}>
          <RRRoutes>
            <Route path={`${LEGACY_BASE_ROUTE}/*`} element={<TestWrapper />} />
          </RRRoutes>
        </Router>
      </Provider>
    );
    expect(
      await screen.findByTitle('Legacy Content Wrapper')
    ).toBeInTheDocument();
    window.postMessage(
      {
        source: 'kbase-ui.app.route-component',
        payload: { request: { original: '/some/hash/path' } },
      },
      '*'
    );
    await waitFor(() => {
      expect(locationSpy).toBeCalledTimes(2);
      expect(locationSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          hash: '',
          pathname: '/legacy',
          search: '',
          state: null,
        })
      );
      expect(locationSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          hash: '',
          pathname: '/legacy/some/hash/path',
          search: '',
          state: null,
        })
      );
    });
  });

  test('Legacy page component sets title from message', async () => {
    const titleSpy = vi.spyOn(layoutSlice, 'usePageTitle');

    render(
      <Provider store={createTestStore()}>
        <Router initialEntries={[LEGACY_BASE_ROUTE]}>
          <RRRoutes>
            <Route path={`${LEGACY_BASE_ROUTE}/*`} element={<Legacy />} />
          </RRRoutes>
        </Router>
      </Provider>
    );
    window.postMessage(
      {
        source: 'kbase-ui.ui.setTitle',
        payload: 'Some Title of Unknown Content',
      },
      '*'
    );
    await waitFor(() => {
      expect(titleSpy).toHaveBeenCalledWith('Some Title of Unknown Content');
    });
    titleSpy.mockRestore();
  });

  test('Legacy page component trys auth from token message', async () => {
    const authSpy = vi.spyOn(authHooks, 'useTryAuthFromToken');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authSpy.mockImplementation((...args) => undefined as any);

    render(
      <Provider store={createTestStore()}>
        <Router initialEntries={[LEGACY_BASE_ROUTE]}>
          <RRRoutes>
            <Route path={`${LEGACY_BASE_ROUTE}/*`} element={<Legacy />} />
          </RRRoutes>
        </Router>
      </Provider>
    );
    window.postMessage(
      {
        source: 'kbase-ui.session.loggedin',
        payload: { token: 'some-interesting-token' },
      },
      '*'
    );
    await waitFor(() => {
      expect(authSpy).toHaveBeenCalledWith('some-interesting-token');
    });
    authSpy.mockRestore();
  });
});
