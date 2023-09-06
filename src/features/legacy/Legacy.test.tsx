import { render, screen, waitFor } from '@testing-library/react';
import { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import {
  MemoryRouter as Router,
  Route,
  Routes as RRRoutes,
  useLocation,
} from 'react-router-dom';
import { createTestStore } from '../../app/store';
import * as authHooks from '../auth/hooks';
import * as layoutSlice from '../layout/layoutSlice';
import Legacy, {
  formatLegacyUrl,
  getLegacyPart,
  isAuthMessage,
  isRouteMessage,
  isTitleMessage,
  LEGACY_BASE_ROUTE,
  useMessageListener,
} from './Legacy';

const setupMessageListener = () => {
  const spy = jest.fn();
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
const authMessage = {
  source: 'kbase-ui.session.loggedin',
  payload: { token: 'some-token' },
};
const nullAuthMessage = {
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

  test('useMessageListener ignores non-target source when NODE_ENV is production', async () => {
    const processEnv = process.env;
    process.env = { ...processEnv, NODE_ENV: 'development' };
    const spy = setupMessageListener();
    window.postMessage('foo', '*');
    await waitFor(() => {
      expect(spy).not.toHaveBeenCalled();
    });
    process.env = processEnv;
  });

  test('isTitleMessage', () => {
    expect(isTitleMessage(titleMessage)).toBe(true);
    expect(isTitleMessage(routeMessage)).toBe(false);
    expect(isTitleMessage(authMessage)).toBe(false);
    expect(isTitleMessage(nullAuthMessage)).toBe(false);
  });

  test('isRouteMessage', () => {
    expect(isRouteMessage(titleMessage)).toBe(false);
    expect(isRouteMessage(routeMessage)).toBe(true);
    expect(isRouteMessage(authMessage)).toBe(false);
    expect(isRouteMessage(nullAuthMessage)).toBe(false);
  });

  test('isAuthMessage', () => {
    expect(isAuthMessage(titleMessage)).toBe(false);
    expect(isAuthMessage(routeMessage)).toBe(false);
    expect(isAuthMessage(authMessage)).toBe(true);
    expect(isAuthMessage(nullAuthMessage)).toBe(true);
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
      `https://${process.env.REACT_APP_KBASE_LEGACY_DOMAIN}/#foo/bar/`
    );
    expect(formatLegacyUrl('/foo/bar/')).toBe(
      `https://${process.env.REACT_APP_KBASE_LEGACY_DOMAIN}/#/foo/bar/`
    );
  });

  test('Legacy page component renders and navigates', async () => {
    const locationSpy = jest.fn();
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
    const titleSpy = jest.spyOn(layoutSlice, 'usePageTitle');

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
    const authSpy = jest.spyOn(authHooks, 'useTryAuthFromToken');
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
