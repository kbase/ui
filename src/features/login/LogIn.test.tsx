import { ThemeProvider } from '@mui/material';
import { fireEvent, render, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LOGIN_ROUTE } from '../../app/routeConstants';
import { createTestStore } from '../../app/store';
import { useFilteredParams } from '../../common/hooks';
import { theme } from '../../theme';
import { LogIn } from './LogIn';

describe('Login', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders', () => {
    const { baseElement } = render(
      <Provider store={createTestStore()}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={[LOGIN_ROUTE]}>
            <Routes>
              <Route path={LOGIN_ROUTE} element={<LogIn />} />
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );
    expect(baseElement).toHaveTextContent('Log in');
    expect(baseElement).toHaveTextContent('New to KBase? Sign up');
  });

  it('create redirectUrl without nextRequest', () => {
    const { baseElement } = render(
      <Provider store={createTestStore()}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={[LOGIN_ROUTE]}>
            <Routes>
              <Route path={LOGIN_ROUTE} element={<LogIn />} />
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );
    const redirectInput = within(baseElement).getByTestId(
      'redirecturl'
    ) as HTMLInputElement;
    expect(redirectInput.value).toBe(
      'http://localhost/login/continue?state=%7B%22origin%22%3A%22http%3A%2F%2Flocalhost%22%7D'
    );
  });

  it('create redirectUrl with nextRequest', () => {
    const loginParams = new URLSearchParams();
    loginParams.set(
      'nextRequest',
      JSON.stringify({
        pathname: '/someRedirect',
      })
    );
    const RoutesWithParams = () => {
      useFilteredParams();
      return (
        <Routes>
          <Route path={LOGIN_ROUTE} element={<LogIn />} />
        </Routes>
      );
    };
    const { baseElement } = render(
      <Provider store={createTestStore()}>
        <ThemeProvider theme={theme}>
          <MemoryRouter
            initialEntries={[`${LOGIN_ROUTE}?${loginParams.toString()}`]}
          >
            <RoutesWithParams />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );
    const redirectInput = within(baseElement).getByTestId(
      'redirecturl'
    ) as HTMLInputElement;
    expect(redirectInput.value).toBe(
      'http://localhost/login/continue?state=%7B%22nextRequest%22%3A%22%7B%5C%22pathname%5C%22%3A%5C%22%2FsomeRedirect%5C%22%7D%22%2C%22origin%22%3A%22http%3A%2F%2Flocalhost%22%7D'
    );
  });

  it('Login button click submits form', () => {
    const { baseElement } = render(
      <Provider store={createTestStore()}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={[LOGIN_ROUTE]}>
            <Routes>
              <Route path={LOGIN_ROUTE} element={<LogIn />} />
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );
    const form = within(baseElement).getByTestId(
      'loginForm'
    ) as HTMLFormElement;
    const button = within(baseElement).getByTestId(
      'loginORCID'
    ) as HTMLButtonElement;
    const submit = jest.fn((e: SubmitEvent) => {
      e.preventDefault();
    });
    form.onsubmit = submit;
    fireEvent.click(button);
    expect(submit).toBeCalled();
    expect(form.action).toBe('http://localhost/services/auth/login/start/');
  });

  it('redirect if logged in', () => {
    const Narratives = jest.fn(() => <></>);
    render(
      <Provider
        store={createTestStore({
          auth: {
            initialized: true,
            token: 'foo',
          },
        })}
      >
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={[LOGIN_ROUTE]}>
            <Routes>
              <Route path={LOGIN_ROUTE} element={<LogIn />} />
              <Route path={'/narratives'} Component={Narratives} />
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );
    expect(Narratives).toBeCalled();
  });

  it('redirect if logged in with nextRequest', () => {
    const loginParams = new URLSearchParams();
    loginParams.set(
      'nextRequest',
      JSON.stringify({
        pathname: '/someRedirect',
      })
    );
    const redirectSpy = jest.fn();
    const Redirect = () => {
      redirectSpy();
      return <></>;
    };
    const RoutesWithParams = () => {
      useFilteredParams();
      return (
        <Routes>
          <Route path={LOGIN_ROUTE} element={<LogIn />} />
          <Route path={'/someRedirect'} element={<Redirect />} />
        </Routes>
      );
    };
    render(
      <Provider
        store={createTestStore({
          auth: {
            initialized: true,
            token: 'foo',
          },
        })}
      >
        <ThemeProvider theme={theme}>
          <MemoryRouter
            initialEntries={[`${LOGIN_ROUTE}?${loginParams.toString()}`]}
          >
            <RoutesWithParams />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );
    expect(redirectSpy).toBeCalled();
  });
});
