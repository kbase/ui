import { fireEvent, screen } from '@testing-library/react';
import { createTestStore } from '../../app/store';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { render } from '@testing-library/react';
import { AccountInformation } from './AccountInformation';
import { setLoginData } from './SignupSlice';
import { theme } from '../../theme';
import { act } from 'react-dom/test-utils';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));
jest.mock('../../common/api/authService', () => ({
  ...jest.requireActual('../../common/api/authService'),
  loginUsernameSuggest: {
    useQuery: jest.fn().mockReturnValue({
      currentData: { availablename: 'testuser' },
      isFetching: false,
    }),
  },
}));

const renderWithProviders = (
  ui: React.ReactElement,
  { store = createTestStore() } = {}
) => {
  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <main style={{ height: '100vh' }}>{ui}</main>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
};

describe('AccountInformation', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    (useNavigate as jest.Mock).mockImplementation(() => mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('redirects to step 1 if no login data', () => {
    const store = createTestStore();
    renderWithProviders(<AccountInformation />, { store });
    expect(mockNavigate).toHaveBeenCalledWith('/signup/1');
  });

  test('displays login data from provider', () => {
    const store = createTestStore();
    store.dispatch(
      setLoginData({
        creationallowed: true,
        expires: 0,
        login: [],
        provider: 'Google',
        create: [
          {
            provemail: 'test@test.com',
            provfullname: 'Test User',
            availablename: 'testuser',
            id: '123',
            provusername: 'testuser',
          },
        ],
      })
    );
    renderWithProviders(<AccountInformation />, { store });
    expect(screen.getAllByText(/Google/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/test@test.com/)[0]).toBeInTheDocument();
  });

  test('form submission with valid data', async () => {
    const store = createTestStore();
    store.dispatch(
      setLoginData({
        creationallowed: true,
        expires: 0,
        login: [],
        provider: 'Google',
        create: [
          {
            provemail: 'test@test.com',
            provfullname: 'Test User',
            availablename: 'testuser',
            id: '123',
            provusername: 'testuser',
          },
        ],
      })
    );
    renderWithProviders(<AccountInformation />, { store });

    await act(() => {
      fireEvent.change(screen.getByRole('textbox', { name: /Full Name/i }), {
        target: { value: 'Test User' },
      });
    });
    await act(() => {
      fireEvent.change(screen.getByRole('textbox', { name: /Email/i }), {
        target: { value: 'test@test.com' },
      });
    });
    await act(() => {
      fireEvent.change(
        screen.getByRole('textbox', { name: /KBase Username/i }),
        {
          target: { value: 'testuser' },
        }
      );
    });
    await act(() => {
      fireEvent.change(screen.getByRole('textbox', { name: /Organization/i }), {
        target: { value: 'Test Org' },
      });
    });
    await act(() => {
      fireEvent.change(screen.getByRole('textbox', { name: /Department/i }), {
        target: { value: 'Test Dept' },
      });
    });

    await act(() => {
      fireEvent.submit(screen.getByTestId('accountinfoform'));
    });

    expect(mockNavigate).toHaveBeenCalledWith('/signup/3');
  });
});
