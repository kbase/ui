import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

import {
  Routes as RRRoutes,
  Route,
  MemoryRouter as Router,
} from 'react-router-dom';
import { TokenInfo } from '../features/auth/authSlice';
import { LEGACY_BASE_ROUTE } from '../features/legacy/constants';
import {
  Authed,
  HashRouteRedirect,
  LOGIN_ROUTE,
  ROOT_REDIRECT_ROUTE,
} from './Routes';
import { createTestStore } from './store';

describe('Routing Utils', () => {
  test('Authed component redirects when user unauthed', () => {
    const SomePageMock = jest.fn().mockImplementation(() => <div />);
    const LoginPageMock = jest.fn().mockImplementation(() => <div />);
    const somePagePath = `/some-path`;
    expect(LOGIN_ROUTE).not.toBe(somePagePath);
    render(
      <Provider store={createTestStore()}>
        <Router initialEntries={[somePagePath]}>
          <RRRoutes>
            <Route
              path={somePagePath}
              element={<Authed element={<SomePageMock />} />}
            />
            <Route path={LOGIN_ROUTE} element={<LoginPageMock />} />
          </RRRoutes>
        </Router>
      </Provider>
    );
    expect(LoginPageMock).toHaveBeenCalled();
    expect(SomePageMock).not.toHaveBeenCalled();
  });

  test('Authed component renders when user is authed', () => {
    const SomePageMock = jest.fn().mockImplementation(() => <div />);
    const LoginPageMock = jest.fn().mockImplementation(() => <div />);
    const somePagePath = `/some-path`;
    const store = createTestStore({
      auth: {
        token: 'some-token',
        username: 'some-user',
        tokenInfo: {} as TokenInfo,
        initialized: true,
      },
    });
    expect(LOGIN_ROUTE).not.toBe(somePagePath);
    render(
      <Provider store={store}>
        <Router initialEntries={[somePagePath]}>
          <RRRoutes>
            <Route
              path={somePagePath}
              element={<Authed element={<SomePageMock />} />}
            />
            <Route path={LOGIN_ROUTE} element={<LoginPageMock />} />
          </RRRoutes>
        </Router>
      </Provider>
    );
    expect(LoginPageMock).not.toHaveBeenCalled();
    expect(SomePageMock).toHaveBeenCalled();
  });

  test('HashRouteRedirect redirects properly for urls WITHOUT a fragment', () => {
    const NarrativePageMock = jest.fn().mockImplementation(() => <div />);
    const LegacyPageMock = jest.fn().mockImplementation(() => <div />);
    render(
      <Router initialEntries={['/']}>
        <RRRoutes>
          <Route path={ROOT_REDIRECT_ROUTE} element={<NarrativePageMock />} />
          <Route
            path={`${LEGACY_BASE_ROUTE()}/*`}
            element={<LegacyPageMock />}
          />
          <Route path={'/'} element={<HashRouteRedirect />} />
        </RRRoutes>
      </Router>
    );
    expect(LegacyPageMock).not.toHaveBeenCalled();
    expect(NarrativePageMock).toHaveBeenCalled();
  });

  test('HashRouteRedirect redirects properly for urls WITH a fragment', () => {
    const NarrativePageMock = jest.fn().mockImplementation(() => <div />);
    const LegacyPageMock = jest.fn().mockImplementation(() => <div />);
    render(
      <Router initialEntries={['/#some-fragment/like/this']}>
        <RRRoutes>
          <Route path={ROOT_REDIRECT_ROUTE} element={<NarrativePageMock />} />
          <Route
            path={`${LEGACY_BASE_ROUTE()}/*`}
            element={<LegacyPageMock />}
          />
          <Route path={'/'} element={<HashRouteRedirect />} />
        </RRRoutes>
      </Router>
    );
    expect(LegacyPageMock).toHaveBeenCalled();
    expect(NarrativePageMock).not.toHaveBeenCalled();
  });
});
