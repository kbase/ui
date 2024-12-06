import { ThemeProvider } from '@mui/material';
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createTestStore } from '../../app/store';
import { theme } from '../../theme';
import { LogInContinue } from './LogInContinue';
import fetchMock from 'jest-fetch-mock';
import { toast } from 'react-hot-toast';
import { noOp } from '../common';
import { kbasePolicies } from './Policies';

jest.mock('react-hot-toast', () => ({
  toast: jest.fn(),
}));

describe('Login Continue', () => {
  beforeEach(() => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();
  });

  it('renders and logs in', async () => {
    // getLoginChoice
    fetchMock.mockResponseOnce(
      JSON.stringify({
        login: [
          {
            id: 'foouserid',
            policyids: Object.values(kbasePolicies).map((p) => ({
              agreedon: 0,
              id: [p.id, p.version].join('.'),
            })),
          },
        ],
      })
    );
    // postLoginPick
    fetchMock.mockResponseOnce(
      JSON.stringify({
        token: {
          token: 'foobartoken',
        },
      })
    );
    // authFromToken
    fetchMock.mockResponseOnce(
      JSON.stringify({
        user: 'someusername',
      })
    );

    const store = createTestStore();
    const Narratives = jest.fn(() => <></>);
    const { container } = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={['/login/continue']}>
            <Routes>
              <Route path={'/login/continue'} element={<LogInContinue />} />
              <Route path={'/narratives'} Component={Narratives} />
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );
    await waitFor(() => expect(container).toHaveTextContent('Logging in'));
    await waitFor(() => {
      expect(store.getState().auth.initialized).toBe(true);
      expect(store.getState().auth.token).toBe('FOOBARTOKEN');
      expect(store.getState().auth.username).toBe('someusername');
      expect(Narratives).toHaveBeenCalled();
    });
  });

  it('renders and logs in with redirect (nextRequest)', async () => {
    // getLoginChoice
    fetchMock.mockResponseOnce(
      JSON.stringify({
        login: [
          {
            id: 'foouserid',
            policyids: Object.values(kbasePolicies).map((p) => ({
              agreedon: 0,
              id: [p.id, p.version].join('.'),
            })),
          },
        ],
      })
    );
    // postLoginPick
    fetchMock.mockResponseOnce(
      JSON.stringify({
        redirecturl:
          'http://localhost/login/continue?state=%7B%22nextRequest%22%3A%22%7B%5C%22pathname%5C%22%3A%5C%22%2FsomeRedirect%5C%22%7D%22%2C%22origin%22%3A%22http%3A%2F%2Flocalhost%22%7D',
        token: {
          token: 'foobartoken',
        },
      })
    );
    // authFromToken
    fetchMock.mockResponseOnce(
      JSON.stringify({
        user: 'someusername',
      })
    );

    const store = createTestStore();
    const SomeRedirect = jest.fn(() => <></>);
    const { container } = render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={['/login/continue']}>
            <Routes>
              <Route path={'/login/continue'} element={<LogInContinue />} />
              <Route path={'/someRedirect'} Component={SomeRedirect} />
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );
    await waitFor(() => expect(container).toHaveTextContent('Logging in'));
    await waitFor(() => {
      expect(store.getState().auth.initialized).toBe(true);
      expect(store.getState().auth.token).toBe('FOOBARTOKEN');
      expect(store.getState().auth.username).toBe('someusername');
      expect(SomeRedirect).toHaveBeenCalled();
    });
  });

  it('getLoginChoice fails gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error');
    consoleError.mockImplementation(noOp);
    // getLoginChoice
    fetchMock.mockResponseOnce('', { status: 500 });
    const Login = jest.fn(() => <></>);
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={['/login/continue']}>
            <Routes>
              <Route path={'/login/continue'} element={<LogInContinue />} />
              <Route path={'/login'} Component={Login} />
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );
    await waitFor(() => {
      expect(store.getState().auth.initialized).toBe(false);
      expect(toast).toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalled();
      expect(Login).toHaveBeenCalled();
    });
  });

  it('postLoginPick fails gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error');
    consoleError.mockImplementation(noOp);
    // getLoginChoice
    fetchMock.mockResponseOnce(
      JSON.stringify({
        login: [
          {
            id: 'foouserid',
            policyids: Object.values(kbasePolicies).map((p) => ({
              agreedon: 0,
              id: [p.id, p.version].join('.'),
            })),
          },
        ],
      })
    );
    // postLoginPick
    fetchMock.mockResponseOnce('', { status: 500 });

    const Login = jest.fn(() => <></>);
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={['/login/continue']}>
            <Routes>
              <Route path={'/login/continue'} element={<LogInContinue />} />
              <Route path={'/login'} Component={Login} />
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );
    await waitFor(() => {
      expect(store.getState().auth.initialized).toBe(false);
      expect(toast).toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalled();
      expect(Login).toHaveBeenCalled();
    });
  });

  it('authFromToken fails gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error');
    consoleError.mockImplementation(noOp);
    // getLoginChoice
    fetchMock.mockResponseOnce(
      JSON.stringify({
        login: [
          {
            id: 'foouserid',
            policyids: Object.values(kbasePolicies).map((p) => ({
              agreedon: 0,
              id: [p.id, p.version].join('.'),
            })),
          },
        ],
      })
    );
    // postLoginPick
    fetchMock.mockResponseOnce(
      JSON.stringify({
        token: {
          token: 'foobartoken',
        },
      })
    );
    // authFromToken
    fetchMock.mockResponseOnce('', { status: 500 });
    const Login = jest.fn(() => <></>);
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={['/login/continue']}>
            <Routes>
              <Route path={'/login/continue'} element={<LogInContinue />} />
              <Route path={'/login'} Component={Login} />
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );
    await waitFor(() => {
      expect(store.getState().auth.initialized).toBe(false);
      expect(toast).toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalled();
      expect(Login).toHaveBeenCalled();
    });
  });

  it('handles new user signup flow', async () => {
    // getLoginChoice - return create data instead of login data
    fetchMock.mockResponseOnce(
      JSON.stringify({
        login: [],
        create: [
          {
            id: 'newuserid',
            provider: 'google',
            username: 'newuser@google.com',
          },
        ],
      })
    );

    const Signup = jest.fn(() => <></>);
    const store = createTestStore();
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={['/login/continue']}>
            <Routes>
              <Route path={'/login/continue'} element={<LogInContinue />} />
              <Route path={'/signup/2'} Component={Signup} />
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

    await waitFor(() => {
      // Check that login data was set in store
      expect(store.getState().signup.loginData).toEqual({
        login: [],
        create: [
          {
            id: 'newuserid',
            provider: 'google',
            username: 'newuser@google.com',
          },
        ],
      });
    });
    await waitFor(() => {
      expect(window.location.pathname === '/signup/2');
    });
  });
});
