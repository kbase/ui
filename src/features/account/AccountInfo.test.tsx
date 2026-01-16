import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AccountInfo } from './AccountInfo';
import * as userProfileApi from '../../common/api/userProfileApi';
import * as authService from '../../common/api/authService';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { createTestStore } from '../../app/store';
import { theme } from '../../theme';
import { vi, Mock } from 'vitest';

// Mock dependencies
vi.mock('react-hot-toast');
vi.mock('../../common/api/userProfileApi');
vi.mock('../../common/api/authService');

// Create a mock store with specific test values
const createMockStore = () =>
  createTestStore({
    auth: {
      token: 'test-token',
      username: 'test-user',
      initialized: true,
    },
  });

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={createMockStore()}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
      </ThemeProvider>
    </Provider>
  );
};

describe('AccountInfo Component', () => {
  const mockProfile = {
    user: {
      username: 'test-user',
      realname: 'Test User',
    },
    profile: {},
  };

  const mockAccountData = {
    user: 'test-user',
    display: 'Test User',
    email: 'test@test.com',
    created: '2023-01-01',
    lastlogin: '2023-12-01',
  };

  beforeEach(() => {
    // Setup API mock returns
    (userProfileApi.getUserProfile.useQuery as Mock).mockReturnValue({
      data: [[mockProfile]],
      refetch: vi.fn(),
    });

    (authService.getMe.useQuery as Mock).mockReturnValue({
      data: mockAccountData,
      refetch: vi.fn(),
    });

    (userProfileApi.setUserProfile.useMutation as Mock).mockReturnValue([
      vi.fn(),
      {
        isLoading: false,
        isSuccess: false,
        isError: false,
        isUninitialized: true,
        reset: vi.fn(),
      },
    ]);

    (authService.setMe.useMutation as Mock).mockReturnValue([
      vi.fn(),
      {
        isLoading: false,
        isSuccess: false,
        isError: false,
        isUninitialized: true,
        reset: vi.fn(),
      },
    ]);
  });

  it('renders the account info form and static information', () => {
    render(<AccountInfo />, { wrapper: TestWrapper });

    expect(screen.getByText('Edit Account')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByText('Account Info')).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('test-user')).toBeInTheDocument();
  });

  it('loads initial form values correctly', () => {
    render(<AccountInfo />, { wrapper: TestWrapper });

    const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;

    expect(nameInput.value).toBe('Test User');
    expect(emailInput.value).toBe('test@test.com');
  });

  it('validates email format', async () => {
    const mockToast = vi.fn();
    (toast as unknown as Mock).mockImplementation(mockToast);
    render(<AccountInfo />, { wrapper: TestWrapper });

    const emailInput = screen.getByLabelText('Email');

    // Clear the field first
    fireEvent.change(emailInput, { target: { value: '' } });

    // Enter invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    // Trigger form submission
    fireEvent.blur(emailInput);
    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);

    // Wait for the error to appear in helper text
    await waitFor(() => {
      expect(mockToast).toBeCalledWith('Invalid email address');
    });
  });

  it('handles successful form submission', async () => {
    const setProfileMock = vi.fn();
    const setMeMock = vi.fn();

    (userProfileApi.setUserProfile.useMutation as Mock).mockReturnValue([
      setProfileMock,
      {
        isLoading: false,
        isSuccess: true,
        isError: false,
        isUninitialized: false,
        reset: vi.fn(),
      },
    ]);

    (authService.setMe.useMutation as Mock).mockReturnValue([
      setMeMock,
      {
        isLoading: false,
        isSuccess: true,
        isError: false,
        isUninitialized: false,
        reset: vi.fn(),
      },
    ]);

    render(<AccountInfo />, { wrapper: TestWrapper });

    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');

    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    fireEvent.change(emailInput, { target: { value: 'new@email.com' } });

    // Trigger form submission
    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);

    // Wait for and verify the API calls
    await waitFor(() => {
      expect(setProfileMock).toHaveBeenCalledWith([
        {
          profile: {
            user: {
              username: 'test-user',
              realname: 'New Name',
            },
            profile: {},
          },
        },
        'test-token',
      ]);
    });

    await waitFor(() => {
      expect(setMeMock).toHaveBeenCalledWith({
        token: 'test-token',
        meUpdate: {
          display: 'New Name',
          email: 'new@email.com',
        },
      });
    });
  });

  it('handles form reset', () => {
    const resetProfileMock = vi.fn();
    const resetMeMock = vi.fn();
    const refetchProfilesMock = vi.fn();
    const refetchAccountMock = vi.fn();

    (userProfileApi.setUserProfile.useMutation as Mock).mockReturnValue([
      vi.fn(),
      { reset: resetProfileMock },
    ]);

    (authService.setMe.useMutation as Mock).mockReturnValue([
      vi.fn(),
      { reset: resetMeMock },
    ]);

    (userProfileApi.getUserProfile.useQuery as Mock).mockReturnValue({
      data: [[mockProfile]],
      refetch: refetchProfilesMock,
    });

    (authService.getMe.useQuery as Mock).mockReturnValue({
      data: mockAccountData,
      refetch: refetchAccountMock,
    });

    render(<AccountInfo />, { wrapper: TestWrapper });

    const resetButton = screen.getByRole('button', { name: 'Reset' });
    fireEvent.click(resetButton);

    expect(resetProfileMock).toHaveBeenCalled();
    expect(resetMeMock).toHaveBeenCalled();
    expect(refetchProfilesMock).toHaveBeenCalled();
    expect(refetchAccountMock).toHaveBeenCalled();
  });

  it('shows loading state during submission', () => {
    (userProfileApi.setUserProfile.useMutation as Mock).mockReturnValue([
      vi.fn(),
      { isLoading: true },
    ]);

    (authService.setMe.useMutation as Mock).mockReturnValue([
      vi.fn(),
      { isLoading: true },
    ]);

    render(<AccountInfo />, { wrapper: TestWrapper });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toContainHTML('fa-spinner');
  });

  it('handles submission errors', async () => {
    const mockToast = vi.fn();
    (toast as unknown as Mock).mockImplementation(mockToast);

    render(<AccountInfo />, { wrapper: TestWrapper });

    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { value: '' } });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalled();
    });
  });

  it('displays success icon after successful submission', async () => {
    (userProfileApi.setUserProfile.useMutation as Mock).mockReturnValue([
      vi.fn(),
      {
        isLoading: false,
        isSuccess: true,
        isError: false,
        isUninitialized: false,
      },
    ]);

    (authService.setMe.useMutation as Mock).mockReturnValue([
      vi.fn(),
      {
        isLoading: false,
        isSuccess: true,
        isError: false,
        isUninitialized: false,
      },
    ]);

    render(<AccountInfo />, { wrapper: TestWrapper });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toContainHTML('fa-check');
  });

  it('displays tooltip content when hovering over About button', async () => {
    render(<AccountInfo />, { wrapper: TestWrapper });

    const aboutButton = screen.getByRole('button', { name: 'About this tab' });
    fireEvent.mouseOver(aboutButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          /You may view and edit edit your basic account information here/
        )
      ).toBeInTheDocument();
    });
  });
});
