import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material';
import { MemoryRouter } from 'react-router-dom';
import { LogInSessions } from './LogInSessions';
import * as authService from '../../common/api/authService';
import { createTestStore } from '../../app/store';
import { theme } from '../../theme';
import { TokenInfo } from '../auth/authSlice';

// Mock dependencies
jest.mock('../../common/api/authService');

const mockLogout = jest.fn();
jest.mock('../login/LogIn', () => ({
  useLogout: jest.fn(() => mockLogout),
}));

const createMockStore = () =>
  createTestStore({
    auth: {
      token: 'test-token',
      tokenInfo: { id: 'current-token-id' } as TokenInfo,
      username: 'test-user',
      initialized: true,
    },
  });

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={createMockStore()}>
      <ThemeProvider theme={theme}>
        <MemoryRouter>{children}</MemoryRouter>
      </ThemeProvider>
    </Provider>
  );
};

describe('LogInSessions Component', () => {
  const mockCurrentToken = {
    created: '2023-01-01T00:00:00Z',
    expires: '2023-01-15T00:00:00Z',
    id: 'current-token-id',
    agent: 'Chrome',
    agentver: '100',
    os: 'Windows',
    osver: '10',
    ip: '127.0.0.1',
    type: 'Login',
  };

  const mockOtherTokens = [
    {
      created: '2023-01-02T00:00:00Z',
      expires: '2023-01-16T00:00:00Z',
      id: 'other-token-id',
      agent: 'Firefox',
      agentver: '98',
      os: 'MacOS',
      osver: '12',
      ip: '192.168.1.1',
      type: 'Login',
    },
  ];

  beforeEach(() => {
    // Setup API mock returns
    (authService.getTokens.useQuery as jest.Mock).mockReturnValue({
      data: {
        current: mockCurrentToken,
        tokens: mockOtherTokens,
      },
    });

    (authService.revokeToken.useMutation as jest.Mock).mockReturnValue([
      jest.fn(),
      { isLoading: false, isSuccess: false, isError: false },
    ]);
  });

  it('renders the current session and other sessions tables', () => {
    render(<LogInSessions />, { wrapper: TestWrapper });

    // Check headers
    expect(screen.getByText('Current Log In Session')).toBeInTheDocument();
    expect(screen.getByText('Other Log In Sessions')).toBeInTheDocument();

    // Check table headers
    const headers = [
      'Created',
      'Expires',
      'Browser',
      'Operating System',
      'IP Address',
      'Action',
    ];
    headers.forEach((header) => {
      expect(screen.getAllByText(header).length).toBeGreaterThan(0);
    });

    // Check current session data
    expect(screen.getByText('Chrome 100')).toBeInTheDocument();
    expect(screen.getByText('Windows 10')).toBeInTheDocument();
    expect(screen.getByText('127.0.0.1')).toBeInTheDocument();

    // Check other session data
    expect(screen.getByText('Firefox 98')).toBeInTheDocument();
    expect(screen.getByText('MacOS 12')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();
  });

  it('shows tooltip content when hovering over About button', async () => {
    render(<LogInSessions />, { wrapper: TestWrapper });

    const aboutButton = screen.getByRole('button', { name: 'About this tab' });
    fireEvent.mouseOver(aboutButton);

    await waitFor(() => {
      expect(
        screen.getByText(/A log in session is created when you log in to KBase/)
      ).toBeInTheDocument();
    });
  });

  it('handles logout for current session', async () => {
    const revokeMock = jest.fn();
    (authService.revokeToken.useMutation as jest.Mock).mockReturnValue([
      revokeMock,
      { isLoading: false, isSuccess: false, isError: false },
    ]);

    render(<LogInSessions />, { wrapper: TestWrapper });

    const logoutButtons = screen.getAllByText('Log out');
    fireEvent.click(logoutButtons[0]); // Other session logout button
  });

  it('handles logout for other sessions', async () => {
    const revokeMock = jest.fn();
    (authService.revokeToken.useMutation as jest.Mock).mockReturnValue([
      revokeMock,
      { isLoading: false, isSuccess: false, isError: false },
    ]);

    render(<LogInSessions />, { wrapper: TestWrapper });

    const logoutButtons = screen.getAllByText('Log out');
    fireEvent.click(logoutButtons[1]); // Other session logout button

    expect(revokeMock).toHaveBeenCalledWith('other-token-id');
  });

  it('shows loading state during revocation', () => {
    (authService.revokeToken.useMutation as jest.Mock).mockReturnValue([
      jest.fn(),
      { isLoading: true },
    ]);

    render(<LogInSessions />, { wrapper: TestWrapper });

    const logoutButton = screen.getAllByText('Log out')[1];
    expect(logoutButton).toContainHTML('fa-spinner');
  });

  it('shows success state after revocation', () => {
    (authService.revokeToken.useMutation as jest.Mock).mockReturnValue([
      jest.fn(),
      { isSuccess: true },
    ]);

    render(<LogInSessions />, { wrapper: TestWrapper });

    const logoutButton = screen.getAllByText('Log out')[1];
    expect(logoutButton).toContainHTML('fa-check');
  });

  it('shows error state on revocation failure', () => {
    (authService.revokeToken.useMutation as jest.Mock).mockReturnValue([
      jest.fn(),
      { isError: true },
    ]);

    render(<LogInSessions />, { wrapper: TestWrapper });

    const logoutButton = screen.getAllByText('Log out')[1];
    expect(logoutButton).toContainHTML('fa-x');
  });

  it('displays message when no other sessions exist', () => {
    (authService.getTokens.useQuery as jest.Mock).mockReturnValue({
      data: {
        current: mockCurrentToken,
        tokens: [],
      },
    });

    render(<LogInSessions />, { wrapper: TestWrapper });

    expect(
      screen.getByText('No additional active log in sessions.')
    ).toBeInTheDocument();
  });
});
