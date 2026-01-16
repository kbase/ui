/* auth/authSlice.test */
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import createFetchMock from 'vitest-fetch-mock';
import { vi, MockInstance } from 'vitest';
import { createTestStore } from '../../app/store';
import { authFromToken, revokeToken } from '../../common/api/authService';
import * as cookies from '../../common/cookie';
import { TokenInfo } from './authSlice';
import { useTokenCookie, useTryAuthFromToken } from './hooks';

const fetchMock = createFetchMock(vi);

let testStore = createTestStore({});
describe('authSlice', () => {
  beforeEach(() => {
    testStore = createTestStore({});
  });

  describe('useTryAuthFromToken', () => {
    let authMock = vi.spyOn(authFromToken, 'useQuery');
    let token: string | undefined;
    const Component = () => {
      useTryAuthFromToken(token);
      return <></>;
    };

    beforeEach(() => {
      authMock = vi.spyOn(authFromToken, 'useQuery');
      token = undefined;
    });

    afterEach(() => {
      authMock.mockClear();
    });

    test('sets auth token and username when successful', async () => {
      token = 'some token';
      authMock.mockImplementation(() => {
        return {
          isSuccess: true,
          data: { user: 'someUser' },
        } as unknown as ReturnType<(typeof authFromToken)['useQuery']>; // Assert mocked response type
      });

      render(
        <Provider store={testStore}>
          <Component />
        </Provider>
      );

      await waitFor(() => {
        // token gets normalized to uppercase
        expect(testStore.getState().auth.token).toBe('SOME TOKEN');
        expect(testStore.getState().auth.username).toBe('someUser');
        expect(testStore.getState().auth.initialized).toBe(true);
      });
    });

    test('fails quietly with invalid token, does not initialize state', async () => {
      token = 'some token';
      authMock.mockImplementation(() => {
        return {
          isSuccess: false,
          isError: true,
        } as unknown as ReturnType<(typeof authFromToken)['useQuery']>; // Assert mocked response type
      });
      render(
        <Provider store={testStore}>
          <Component />
        </Provider>
      );
      await waitFor(() => {
        expect(testStore.getState().auth.token).toBe(undefined);
        expect(testStore.getState().auth.username).toBe(undefined);
        expect(testStore.getState().auth.initialized).toBe(false);
      });
    });
  });

  describe('revokeToken', () => {
    beforeEach(() => {
      testStore = createTestStore({
        auth: {
          username: 'someUser',
          token: 'foo',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tokenInfo: { id: 'existing-tokenid' } as TokenInfo,
          initialized: true,
        },
      });
      fetchMock.enableMocks();
    });

    afterEach(() => {
      fetchMock.disableMocks();
    });

    test('Auth token gets removed from state if identical token is revoked', async () => {
      fetchMock.mockOnce(''); // force the revokeToken call to succeed
      await testStore.dispatch(revokeToken.initiate('existing-tokenid'));
      await waitFor(() => {
        expect(testStore.getState().auth.token).toBe(undefined);
        expect(testStore.getState().auth.username).toBe(undefined);
        expect(testStore.getState().auth.initialized).toBe(true);
      });
    });

    test('Auth token remains in state if some other token is revoked', async () => {
      fetchMock.mockOnce(''); // force the revokeToken call to succeed
      await testStore.dispatch(revokeToken.initiate('other-tokenid'));
      await waitFor(() => {
        expect(testStore.getState().auth.token).toBe('foo');
        expect(testStore.getState().auth.username).toBe('someUser');
        expect(testStore.getState().auth.initialized).toBe(true);
      });
    });
  });

  describe('useTokenCookie', () => {
    let useCookieMock: MockInstance;
    let consoleErrorMock: MockInstance;
    let mockCookieVals: Record<string, string> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let setTokenCookieMocks: Record<string, any> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let clearTokenCookieMocks: Record<string, any> = {};
    beforeAll(() => {
      useCookieMock = vi.spyOn(cookies, 'useCookie');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useCookieMock.mockImplementation((name?: string): any => {
        const key = name || 'UNKNOWN';
        setTokenCookieMocks[key] ??= vi.fn((val: string) => {
          if (val) mockCookieVals[key] = val;
        });
        clearTokenCookieMocks[key] ??= vi.fn(() => {
          mockCookieVals[key] = '';
        });
        return [
          mockCookieVals[key] || '',
          setTokenCookieMocks[key],
          clearTokenCookieMocks[key],
        ];
      });
      consoleErrorMock = vi.spyOn(console, 'error');
      consoleErrorMock.mockImplementation(() => undefined);
    });
    beforeEach(() => {
      mockCookieVals = {};
      setTokenCookieMocks = {};
      clearTokenCookieMocks = {};
      useCookieMock.mockClear();
      consoleErrorMock.mockClear();
    });
    afterAll(() => {
      useCookieMock.mockRestore();
      consoleErrorMock.mockRestore();
    });

    test('useTokenCookie clears cookie if auth token is undefined', async () => {
      const Component = () => {
        useTokenCookie('kbase_session');
        return <></>;
      };
      render(
        <Provider store={testStore}>
          <Component />
        </Provider>
      );
      await waitFor(() => {
        expect(clearTokenCookieMocks['kbase_session']).toHaveBeenCalledWith();
        expect(consoleErrorMock).not.toHaveBeenCalled();
      });
    });

    test('useTokenCookie sets cookie if auth token exists with expiration', async () => {
      const auth = {
        token: 'some-token',
        username: 'some-user',
        tokenInfo: {
          expires: Date.now() + Math.floor(Math.random() * 10000),
        } as TokenInfo,
        initialized: true,
      };
      const Component = () => {
        useTokenCookie('kbase_session');
        return <></>;
      };
      render(
        <Provider store={createTestStore({ auth })}>
          <Component />
        </Provider>
      );
      await waitFor(() => {
        expect(setTokenCookieMocks['kbase_session']).toHaveBeenCalledWith(
          'some-token',
          {
            expires: new Date(auth.tokenInfo.expires),
          }
        );
        expect(consoleErrorMock).not.toHaveBeenCalled();
      });
    });

    test('useTokenCookie sets backup cookie if auth token exists with expiration', async () => {
      const auth = {
        token: 'some-token',
        username: 'some-user',
        tokenInfo: {
          expires: Date.now() + Math.floor(Math.random() * 10000),
        } as TokenInfo,
        initialized: true,
      };
      const Component = () => {
        useTokenCookie('kbase_session', 'backup_cookie', '.backup.domain');
        return <></>;
      };
      render(
        <Provider store={createTestStore({ auth })}>
          <Component />
        </Provider>
      );
      await waitFor(() => {
        expect(useCookieMock).toHaveBeenCalledWith('backup_cookie', {
          domain: '.backup.domain',
          path: '/',
          secure: true,
        });
        expect(setTokenCookieMocks['backup_cookie']).toHaveBeenCalledWith(
          'some-token',
          {
            expires: new Date(auth.tokenInfo.expires),
          }
        );
        expect(consoleErrorMock).not.toHaveBeenCalled();
      });
    });

    test('useTokenCookie sets backup cookie if missing', async () => {
      const auth = {
        token: 'some-token',
        username: 'some-user',
        tokenInfo: {
          expires: Date.now() + Math.floor(Math.random() * 10000),
        } as TokenInfo,
        initialized: true,
      };
      mockCookieVals['kbase_session'] = 'some-token';
      const Component = () => {
        useTokenCookie('kbase_session', 'backup_cookie', '.backup.domain');
        return <></>;
      };
      render(
        <Provider store={createTestStore({ auth })}>
          <Component />
        </Provider>
      );
      await waitFor(() => {
        expect(useCookieMock).toHaveBeenCalledWith('backup_cookie', {
          domain: '.backup.domain',
          path: '/',
          secure: true,
        });
        expect(setTokenCookieMocks['backup_cookie']).toHaveBeenCalledWith(
          'some-token',
          {
            expires: new Date(auth.tokenInfo.expires),
          }
        );
        expect(consoleErrorMock).not.toHaveBeenCalled();
      });
    });

    test('useTokenCookie wont set backup cookie if domain is empty', async () => {
      const auth = {
        token: 'some-token',
        username: 'some-user',
        tokenInfo: {
          expires: Date.now() + Math.floor(Math.random() * 10000),
        } as TokenInfo,
        initialized: true,
      };
      mockCookieVals['kbase_session'] = 'some-token';
      const Component = () => {
        useTokenCookie('kbase_session', 'backup_cookie', '');
        return <></>;
      };
      render(
        <Provider store={createTestStore({ auth })}>
          <Component />
        </Provider>
      );
      await waitFor(() => {
        expect(useCookieMock).toHaveBeenCalledWith('backup_cookie', {
          domain: '',
          path: '/',
          secure: true,
        });
        expect(setTokenCookieMocks['backup_cookie']).not.toHaveBeenCalled();
        expect(consoleErrorMock).toHaveBeenCalledWith(
          'Backup cookie cannot be set due to bad configuration.'
        );
      });
    });

    test('useTokenCookie sets cookie in development mode', async () => {
      const originalMode = import.meta.env.MODE;
      (import.meta.env as Record<string, string>).MODE = 'development';
      const auth = {
        token: 'some-token',
        username: 'some-user',
        tokenInfo: {
          expires: Date.now() + 1,
        } as TokenInfo,
        initialized: true,
      };
      const Component = () => {
        useTokenCookie('kbase_session');
        return <></>;
      };
      render(
        <Provider store={createTestStore({ auth })}>
          <Component />
        </Provider>
      );
      await waitFor(() => {
        expect(setTokenCookieMocks['kbase_session']).toHaveBeenCalledWith(
          'some-token',
          {
            expires: new Date(auth.tokenInfo.expires),
          }
        );
        expect(consoleErrorMock).not.toHaveBeenCalled();
      });
      (import.meta.env as Record<string, string>).MODE = originalMode;
    });

    test('useTokenCookie does nothing and `console.error`s if token is defined but tokenInfo.expires is not', async () => {
      const auth = {
        token: 'some-token',
        username: 'some-user',
        tokenInfo: undefined,
        initialized: true,
      };
      const Component = () => {
        useTokenCookie('kbase_session');
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
        expect(setTokenCookieMocks['kbase_session']).not.toHaveBeenCalled();
      });
    });

    test('useTokenCookie clears cookie for bad cookie token and empty auth state', async () => {
      const auth = { initialized: false };
      mockCookieVals['kbase_session'] = 'AAAAAA';
      const mock = vi.spyOn(authFromToken, 'useQuery');
      mock.mockImplementation(() => {
        return {
          isSuccess: false,
          isError: true,
          isFetching: false,
        } as unknown as ReturnType<(typeof authFromToken)['useQuery']>; // Assert mocked response type
      });
      const Component = () => {
        useTokenCookie('kbase_session');
        return <></>;
      };
      render(
        <Provider store={createTestStore({ auth })}>
          <Component />
        </Provider>
      );
      await waitFor(() => {
        expect(setTokenCookieMocks['kbase_session']).not.toBeCalled();
        expect(clearTokenCookieMocks['kbase_session']).toBeCalled();
      });
      mock.mockClear();
    });

    test('useTokenCookie sets cookie for bad cookie token and defined auth state', async () => {
      const auth = {
        token: 'some-token',
        username: 'some-user',
        tokenInfo: {
          expires: Date.now() + 100,
        } as TokenInfo,
        initialized: true,
      };
      mockCookieVals['kbase_session'] = 'AAAAAA';
      const mock = vi.spyOn(authFromToken, 'useQuery');
      mock.mockImplementation(() => {
        return {
          isSuccess: false,
          isError: true,
          isFetching: false,
        } as unknown as ReturnType<(typeof authFromToken)['useQuery']>; // Assert mocked response type
      });
      const Component = () => {
        useTokenCookie('kbase_session');
        return <></>;
      };
      render(
        <Provider store={createTestStore({ auth })}>
          <Component />
        </Provider>
      );
      await waitFor(() => {
        expect(setTokenCookieMocks['kbase_session']).toBeCalled();
        expect(clearTokenCookieMocks['kbase_session']).not.toBeCalled();
      });
      mock.mockClear();
    });

    test('useTokenCookie does not set cookie while awaiting auth response', async () => {
      const auth = { initialized: false };
      mockCookieVals['kbase_session'] = 'AAAAAA';
      const mock = vi.spyOn(authFromToken, 'useQuery');
      mock.mockImplementation(() => {
        return {
          isSuccess: false,
          isError: false,
          isFetching: true,
        } as unknown as ReturnType<(typeof authFromToken)['useQuery']>; // Assert mocked response type
      });
      const Component = () => {
        useTokenCookie('kbase_session');
        return <></>;
      };
      const { rerender } = render(
        <Provider store={createTestStore({ auth })}>
          <Component />
        </Provider>
      );
      await waitFor(() => {
        expect(setTokenCookieMocks['kbase_session']).not.toBeCalled();
        expect(clearTokenCookieMocks['kbase_session']).not.toBeCalled();
      });
      mock.mockImplementation(() => {
        return {
          isSuccess: true,
          isError: false,
          isFetching: false,
          data: { user: 'someUser', expires: 10 },
        } as unknown as ReturnType<(typeof authFromToken)['useQuery']>; // Assert mocked response type
      });
      rerender(
        <Provider store={createTestStore({ auth })}>
          <Component />
        </Provider>
      );
      await waitFor(() => {
        expect(setTokenCookieMocks['kbase_session']).toBeCalledWith('AAAAAA', {
          expires: new Date(10),
        });
        expect(clearTokenCookieMocks['kbase_session']).not.toBeCalled();
      });
      mock.mockClear();
    });
  });
});
