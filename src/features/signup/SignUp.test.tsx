import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { gravatarHash, SignUp, useDoSignup } from './SignUp';
import { loginCreate } from '../../common/api/authService';
import { setUserProfile } from '../../common/api/userProfileApi';
import { BrowserRouter, useNavigate, useParams } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createTestStore } from '../../app/store';
import { ThemeProvider } from '@mui/material';
import { theme } from '../../theme';
import { vi, Mock } from 'vitest';

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: vi.fn(),
  useParams: vi.fn(),
}));

const mockNavigate = vi.fn();
const mockScrollTo = vi.fn();

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

describe('SignUp', () => {
  beforeEach(() => {
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    (useParams as Mock).mockReturnValue({ step: '1' });
    Element.prototype.scrollTo = mockScrollTo;
  });

  it('renders signup steps', () => {
    renderWithProviders(<SignUp />);
    expect(screen.getByText('Sign up for KBase')).toBeInTheDocument();
    expect(
      screen.getByText('Sign up with a supported provider')
    ).toBeInTheDocument();
    expect(screen.getByText('Account information')).toBeInTheDocument();
    expect(screen.getByText('KBase use policies')).toBeInTheDocument();
  });

  it('navigates between steps when clicking previous steps', async () => {
    (useParams as Mock).mockReturnValue({ step: '3' });
    renderWithProviders(<SignUp />);

    const step1 = screen.getByText('Sign up with a supported provider');
    await userEvent.click(step1);
    expect(mockNavigate).toHaveBeenCalledWith('/signup/1');
    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
  });
});

describe('useDoSignup', () => {
  const mockLoginCreateMutation = vi.fn();
  const mockSetUserProfileMutation = vi.fn();

  beforeEach(() => {
    vi.spyOn(loginCreate, 'useMutation').mockReturnValue([
      mockLoginCreateMutation,
      {
        isUninitialized: false,
        isSuccess: true,
        data: { token: { token: 'someToken' } },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    ]);
    vi.spyOn(setUserProfile, 'useMutation').mockReturnValue([
      mockSetUserProfileMutation,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { isUninitialized: true } as any,
    ]);
    (useNavigate as Mock).mockReturnValue(mockNavigate);
  });

  it('calls login create and set user profile mutations', async () => {
    const mockStore = createTestStore({
      signup: {
        loginData: {
          create: [
            {
              id: '123',
              availablename: '',
              provemail: '',
              provfullname: '',
              provusername: '',
            },
          ],
          creationallowed: true,
          expires: 0,
          login: [],
          provider: 'Google',
        },
        account: {
          username: 'testuser',
          display: 'Test User',
          email: 'test@test.com',
          policyids: [],
        },
        profile: {
          userdata: {
            avatarOption: 'gravatar',
            department: '',
            gravatarDefault: 'identicon',
            organization: '',
          },
          surveydata: {
            referralSources: {
              question: '',
              response: {},
            },
          },
        },
      },
    });

    let doSignup: (policyIds: string[]) => void;
    act(() => {
      const TestComponent = () => {
        [doSignup] = useDoSignup();
        return null;
      };
      renderWithProviders(<TestComponent />, {
        store: mockStore,
      });
    });

    await act(async () => {
      doSignup(['policy1']);
    });

    expect(mockLoginCreateMutation).toHaveBeenCalledWith({
      id: '123',
      user: 'testuser',
      display: 'Test User',
      email: 'test@test.com',
      policyids: ['policy1'],
      linkall: false,
    });

    expect(mockSetUserProfileMutation).toHaveBeenCalledWith([
      {
        profile: {
          user: {
            username: 'testuser',
            realname: 'Test User',
          },
          profile: {
            metadata: expect.any(Object),
            preferences: {},
            synced: {
              gravatarHash: gravatarHash('test@test.com'),
            },
            userdata: {
              avatarOption: 'gravatar',
              department: '',
              gravatarDefault: 'identicon',
              organization: '',
            },
            surveydata: {
              referralSources: {
                question: '',
                response: {},
              },
            },
          },
        },
      },
      'someToken',
    ]);
  });
});
