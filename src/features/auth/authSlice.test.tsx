/* auth/authSlice.test */
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import fetchMock from 'jest-fetch-mock';
import { createTestStore } from '../../app/store';
import { authFromToken, revokeToken } from '../../common/api/authService';
import * as cookies from '../../common/cookie';
import { TokenInfo } from './authSlice';
import {
  useAuthenticateFromToken,
  useInitializeAuthStateFromCookie,
  useSyncAuthStateFromCookie,
  useSyncCookieFromAuthState,
} from './hooks';

export const DEFAULT_AUTH_COOKIE_NAME = 'kbase_session';

let testStore = createTestStore({});
describe('authSlice', () => {
  beforeEach(() => {
    testStore = createTestStore({});
  });

  // TODO: add onAuthResolved to tests

  test('useAuthenticateFromToken sets auth token and username', async () => {
    const mock = jest.spyOn(authFromToken, 'useQuery');
    // Note this only works after the app is initialized
    const testStore = createTestStore({
      auth: {
        initialized: true,
      },
    });

    const testToken = 'BBBBBB';
    mock.mockImplementation(() => {
      return {
        isSuccess: true,
        isLoading: false,
        originalArgs: testToken,
        data: { user: 'someUser' },
      } as unknown as ReturnType<typeof authFromToken['useQuery']>; // Assert mocked response type
    });

    const Component = () => {
      const { authenticate } = useAuthenticateFromToken();

      // Simulates an external event being received.
      window.setTimeout(() => {
        authenticate({
          token: testToken,
          onAuthResolved: () => {
            return;
          },
        });
      }, 100);

      return <></>;
    };

    render(
      <Provider store={testStore}>
        <Component />
      </Provider>
    );

    await waitFor(() => {
      expect(testStore.getState().auth.token).toBe(testToken);
      expect(testStore.getState().auth.username).toBe('someUser');
    });
    mock.mockClear();
  });

  test('useTryAuthFromToken fails quietly with invalid token', async () => {
    const mock = jest.spyOn(authFromToken, 'useQuery');
    mock.mockImplementation(() => {
      return {
        isSuccess: false,
        isError: true,
      } as unknown as ReturnType<typeof authFromToken['useQuery']>; // Assert mocked response type
    });
    const Component = () => {
      const { authenticate } = useAuthenticateFromToken();

      // setToken({ token: 'some token' });
      window.setTimeout(() => {
        authenticate({
          token: 'some token',
          onAuthResolved: () => {
            return;
          },
        });
      }, 100);

      return <></>;
    };
    render(
      <Provider store={testStore}>
        <Component />
      </Provider>
    );
    await waitFor(() => {
      expect(testStore.getState().auth.token).toBe(undefined);
      expect(testStore.getState().auth.username).toBe(undefined);
    });
    mock.mockClear();
  });

  test('Auth token gets removed from state if revoked', async () => {
    const testStore = createTestStore({
      auth: {
        username: 'someUser',
        token: 'foo',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tokenInfo: { id: 'existing-tokenid' } as TokenInfo,
        initialized: true,
      },
    });
    fetchMock.enableMocks();
    fetchMock.mockOnce(''); // force the next call to succeed
    await testStore.dispatch(revokeToken.initiate('existing-tokenid'));
    await waitFor(() => {
      expect(testStore.getState().auth.token).toBe(undefined);
      expect(testStore.getState().auth.username).toBe(undefined);
    });
    fetchMock.disableMocks();
  });

  test('Auth token remains if other token revoked', async () => {
    const testStore = createTestStore({
      auth: {
        username: 'someUser',
        token: 'foo',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tokenInfo: { id: 'existing-tokenid' } as TokenInfo,
        initialized: true,
      },
    });
    fetchMock.enableMocks();
    fetchMock.mockOnce(''); // force the next call to succeed
    await testStore.dispatch(revokeToken.initiate('other-tokenid'));
    await waitFor(() => {
      expect(testStore.getState().auth.token).toBe('foo');
      expect(testStore.getState().auth.username).toBe('someUser');
    });
    fetchMock.disableMocks();
  });

  describe('useAuthenticateFromToken custom hook', () => {
    let useCookieMock: jest.SpyInstance<
      ReturnType<typeof cookies.useCookie>,
      Parameters<typeof cookies.useCookie>
    >;
    let consoleErrorMock: jest.SpyInstance<
      ReturnType<typeof console.error>,
      Parameters<typeof console.error>
    >;
    let mockCookieVal = '';
    const setCookieTokenMock = jest.fn();
    const clearTokenCookieMock = jest.fn();
    beforeAll(() => {
      useCookieMock = jest.spyOn(cookies, 'useCookie');
      useCookieMock.mockImplementation(() => [
        mockCookieVal,
        setCookieTokenMock,
        clearTokenCookieMock,
      ]);
      consoleErrorMock = jest.spyOn(console, 'error');
      consoleErrorMock.mockImplementation(() => undefined);
    });
    beforeEach(() => {
      setCookieTokenMock.mockClear();
      clearTokenCookieMock.mockClear();
      consoleErrorMock.mockClear();
    });
    afterAll(() => {
      setCookieTokenMock.mockRestore();
      clearTokenCookieMock.mockRestore();
      consoleErrorMock.mockRestore();
    });

    test('clears cookie if auth token is undefined', async () => {
      const Component = () => {
        useInitializeAuthStateFromCookie(DEFAULT_AUTH_COOKIE_NAME);

        // This will set the auth, which will initialize the app with the mock cookie
        // val, which is an empty string, and results in an unauthenticated state.
        useSyncAuthStateFromCookie(DEFAULT_AUTH_COOKIE_NAME);

        // And this custom hook causes the cookie to be set based on the auth state.
        // When the auth state is moved to unauthenticated above, the change in auth
        // state will percolate to this hook, which will then "clear" the cookie.
        useSyncCookieFromAuthState(DEFAULT_AUTH_COOKIE_NAME);

        return <></>;
      };
      render(
        <Provider store={testStore}>
          <Component />
        </Provider>
      );
      await waitFor(() => {
        expect(clearTokenCookieMock).toHaveBeenCalledWith();
        expect(consoleErrorMock).not.toHaveBeenCalled();
      });
    });

    test('sets cookie if auth token exists with expiration', async () => {
      const auth = {
        token: 'some-token',
        username: 'some-user',
        tokenInfo: {
          expires: Date.now() + Math.floor(Math.random() * 10000),
        } as TokenInfo,
        initialized: true,
      };
      const Component = () => {
        // This will set the auth, which will initialize the app with the mock cookie
        // val, which is as defined above.
        useSyncAuthStateFromCookie('kbase_session');

        // And this custom hook causes the cookie to be set based on the auth state.
        // When the auth state is moved to authenticated above, the change in auth
        // state will percolate to this hook, which will then set the cookie.
        useSyncCookieFromAuthState('kbase_session');

        return <></>;
      };
      render(
        <Provider store={createTestStore({ auth })}>
          <Component />
        </Provider>
      );
      await waitFor(() => {
        expect(setCookieTokenMock).toHaveBeenCalledWith(
          'some-token',
          expect.objectContaining({
            expires: new Date(auth.tokenInfo.expires),
          })
        );
        expect(consoleErrorMock).not.toHaveBeenCalled();
      });
    });

    test('sets cookie in development mode', async () => {
      const processEnv = process.env;
      process.env = { ...processEnv, NODE_ENV: 'development' };
      const auth = {
        token: 'some-token',
        username: 'some-user',
        tokenInfo: {
          expires: Date.now() + 1,
        } as TokenInfo,
        initialized: true,
      };
      const Component = () => {
        useSyncAuthStateFromCookie('kbase_session');
        useSyncCookieFromAuthState('kbase_session');
        return <></>;
      };
      render(
        <Provider store={createTestStore({ auth })}>
          <Component />
        </Provider>
      );
      await waitFor(() => {
        expect(setCookieTokenMock).toHaveBeenCalledWith(
          'some-token',
          expect.objectContaining({
            expires: new Date(auth.tokenInfo.expires),
          })
        );
        expect(consoleErrorMock).not.toHaveBeenCalled();
      });
      process.env = processEnv;
    });

    test('does nothing and `console.error`s if token is defined but tokenInfo.expires is not', async () => {
      const auth = {
        token: 'some-token',
        username: 'some-user',
        tokenInfo: undefined,
        initialized: true,
      };
      const Component = () => {
        useSyncAuthStateFromCookie('kbase_session');
        useSyncCookieFromAuthState('kbase_session');
        return <></>;
      };

      render(
        <Provider store={createTestStore({ auth })}>
          <Component />
        </Provider>
      );
      await waitFor(() => {
        expect(consoleErrorMock).toHaveBeenCalledWith(
          'Could not set token cookie, missing expire time'
        );
        expect(setCookieTokenMock).not.toHaveBeenCalled();
      });
    });

    test('clears cookie for bad cookie token and empty auth state', async () => {
      const auth = { initialized: false };
      mockCookieVal = 'AAAAAA';
      const mock = jest.spyOn(authFromToken, 'useQuery');
      mock.mockImplementation(() => {
        return {
          isSuccess: false,
          isError: true,
          isFetching: false,
          originalArgs: mockCookieVal,
        } as unknown as ReturnType<typeof authFromToken['useQuery']>; // Assert mocked response type
      });
      const Component = () => {
        useInitializeAuthStateFromCookie(DEFAULT_AUTH_COOKIE_NAME);
        useSyncAuthStateFromCookie(DEFAULT_AUTH_COOKIE_NAME);
        useSyncCookieFromAuthState(DEFAULT_AUTH_COOKIE_NAME);
        return <></>;
      };
      render(
        <Provider store={createTestStore({ auth })}>
          <Component />
        </Provider>
      );
      await waitFor(() => {
        expect(setCookieTokenMock).not.toBeCalled();
        expect(clearTokenCookieMock).toBeCalled();
      });
      mock.mockClear();
    });

    /**
     * Hmm, the test did not seem to be correct, and I don't understand the situation it
     * is supposed to simulate.
     *
     * TODO: make sure we understand this case!
     *
     * This simulates the case in which:
     * - the auth has already been determined, and the token info stored (some-token)
     * - a cookie is present in the browser (AAAAAA)
     * - the first run of useSyncAuthSTateFromCookie will run the query below and get an error
     * - this causes the auth to be unset
     * - the first run of useSyncCookieFromAUthState notices a valid auth state and sets
     *   the cookie accordingly (some-token)
     */
    test('sets cookie for bad cookie token and defined auth state', async () => {
      const auth = {
        token: 'some-token',
        username: 'some-user',
        tokenInfo: {
          expires: Date.now() + 100,
        } as TokenInfo,
        initialized: true,
      };
      mockCookieVal = 'AAAAAA';
      const mock = jest.spyOn(authFromToken, 'useQuery');
      mock.mockImplementation(() => {
        return {
          isSuccess: false,
          isError: true,
          isFetching: false,
          originalArgs: mockCookieVal,
        } as unknown as ReturnType<typeof authFromToken['useQuery']>; // Assert mocked response type
      });
      const Component = () => {
        useInitializeAuthStateFromCookie(DEFAULT_AUTH_COOKIE_NAME);
        useSyncAuthStateFromCookie(DEFAULT_AUTH_COOKIE_NAME);
        useSyncCookieFromAuthState(DEFAULT_AUTH_COOKIE_NAME);
        return <></>;
      };
      render(
        <Provider store={createTestStore({ auth })}>
          <Component />
        </Provider>
      );
      await waitFor(() => {
        expect(setCookieTokenMock).toBeCalled();
        expect(clearTokenCookieMock).toBeCalled();
      });
      mock.mockClear();
    });

    test('auth is initialized from cookie token if not initially initialized', async () => {
      // Not initialized
      const auth = { initialized: false };

      // But have a cookie
      mockCookieVal = 'AAAAAA';

      // Here we simulate that the query is running for the first time.
      const mock = jest.spyOn(authFromToken, 'useQuery');
      mock.mockImplementation(() => {
        return {
          isSuccess: false,
          isError: false,
          isFetching: true,
          originalArgs: mockCookieVal,
        } as unknown as ReturnType<typeof authFromToken['useQuery']>; // Assert mocked response type
      });

      // Here we simulate the hooks used in App.tsx
      const Component = () => {
        useInitializeAuthStateFromCookie('kbase_session');
        useSyncAuthStateFromCookie('kbase_session');
        useSyncCookieFromAuthState('kbase_session');
        return <></>;
      };
      const { rerender } = render(
        <Provider store={createTestStore({ auth })}>
          <Component />
        </Provider>
      );
      await waitFor(() => {
        expect(setCookieTokenMock).not.toBeCalled();
        expect(clearTokenCookieMock).not.toBeCalled();
      });

      // Some time later, the token query succeeds...
      mock.mockImplementation(() => {
        return {
          isSuccess: true,
          isError: false,
          isFetching: false,
          originalArgs: mockCookieVal,
          data: { user: 'someUser', expires: 10 },
        } as unknown as ReturnType<typeof authFromToken['useQuery']>; // Assert mocked response type
      });
      rerender(
        <Provider store={createTestStore({ auth })}>
          <Component />
        </Provider>
      );
      await waitFor(() => {
        expect(setCookieTokenMock).toBeCalledWith(
          'AAAAAA',
          expect.objectContaining({
            expires: new Date(10),
          })
        );
        expect(clearTokenCookieMock).not.toBeCalled();
      });
      mock.mockClear();
    });

    /**
     * Well, let us look at this. The query is only run when the cookie token changes,
     * but that is not what triggers a cookie setting. Rather a the cookie is synced to
     * auth state at all times;
     */
    // test("useCookie's setCookieToken does not set cookie while awaiting auth response", async () => {
    //   const auth = { initialized: true };
    //   mockCookieVal = 'AAAAAA';
    //   const mock = jest.spyOn(authFromToken, 'useQuery');
    //   mock.mockImplementation(() => {
    //     return {
    //       isSuccess: false,
    //       isError: false,
    //       isFetching: true,
    //       originalArgs: mockCookieVal,
    //     } as unknown as ReturnType<(typeof authFromToken)['useQuery']>; // Assert mocked response type
    //   });
    //   const Component = () => {
    //     useInitializeAuthStateFromCookie('kbase_session');
    //     useSyncAuthStateFromCookie('kbase_session');
    //     useSyncCookieFromAuthState('kbase_session');
    //     return <></>;
    //   };
    //   const { rerender } = render(
    //     <Provider store={createTestStore({ auth })}>
    //       <Component />
    //     </Provider>
    //   );
    //   await waitFor(() => {
    //     expect(setCookieTokenMock).not.toBeCalled();
    //     expect(clearTokenCookieMock).not.toBeCalled();
    //   });

    //   // Some time later, the token query succeeds...
    //   mock.mockImplementation(() => {
    //     return {
    //       isSuccess: true,
    //       isError: false,
    //       isFetching: false,
    //       originalArgs: mockCookieVal,
    //       data: { user: 'someUser', expires: 10 },
    //     } as unknown as ReturnType<(typeof authFromToken)['useQuery']>; // Assert mocked response type
    //   });
    //   rerender(
    //     <Provider store={createTestStore({ auth })}>
    //       <Component />
    //     </Provider>
    //   );
    //   await waitFor(() => {
    //     expect(setCookieTokenMock).toBeCalledWith(
    //       'AAAAAA',
    //       expect.objectContaining({
    //         expires: new Date(10),
    //       })
    //     );
    //     expect(clearTokenCookieMock).not.toBeCalled();
    //   });
    //   mock.mockClear();
    // });
  });
});
