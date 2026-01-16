import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Mock } from 'vitest';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material';
import { MemoryRouter } from 'react-router-dom';
import { LinkedProviders } from './LinkedProviders';
import * as authService from '../../common/api/authService';
import { toast } from 'react-hot-toast';
import { createTestStore } from '../../app/store';
import { theme } from '../../theme';

// Mock dependencies
vi.mock('react-hot-toast');
vi.mock('../../common/api/authService');

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
        <MemoryRouter>{children}</MemoryRouter>
      </ThemeProvider>
    </Provider>
  );
};

describe('LinkedProviders Component', () => {
  const mockIdentities = [
    {
      id: '1',
      provider: 'Google',
      provusername: 'test@gmail.com',
    },
    {
      id: '2',
      provider: 'ORCID',
      provusername: '0000-0000-0000-0001',
    },
  ];

  beforeEach(() => {
    // Setup API mock returns
    (authService.getMe.useQuery as Mock).mockReturnValue({
      data: { idents: mockIdentities },
    });

    (authService.unlinkID.useMutation as Mock).mockReturnValue([
      vi.fn(),
      { isLoading: false, isSuccess: false, isError: false },
    ]);

    (authService.getLinkChoice.useQuery as Mock).mockReturnValue({
      data: null,
    });

    (authService.postLinkPick.useMutation as Mock).mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ]);
  });

  it('renders the linked providers table', () => {
    render(<LinkedProviders />, { wrapper: TestWrapper });

    expect(screen.getByText('Currently Linked Providers')).toBeInTheDocument();
    expect(screen.getByText('Provider')).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('test@gmail.com')).toBeInTheDocument();
  });

  it('shows tooltip content when hovering over About button', async () => {
    render(<LinkedProviders />, { wrapper: TestWrapper });

    const aboutButton = screen.getByRole('button', { name: 'About this tab' });
    fireEvent.mouseOver(aboutButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          /This tab provides access to all of the the external accounts/
        )
      ).toBeInTheDocument();
    });
  });

  it('allows unlinking when multiple providers exist', async () => {
    const unlinkMock = vi.fn();
    (authService.unlinkID.useMutation as Mock).mockReturnValue([
      unlinkMock,
      { isLoading: false },
    ]);

    render(<LinkedProviders />, { wrapper: TestWrapper });

    const unlinkButtons = screen.getAllByText('Unlink');
    fireEvent.click(unlinkButtons[0]);

    expect(unlinkMock).toHaveBeenCalledWith({
      token: 'test-token',
      id: '1',
    });
  });

  it('disables unlink button when only one provider exists', () => {
    (authService.getMe.useQuery as Mock).mockReturnValue({
      data: { idents: [mockIdentities[0]] },
    });

    render(<LinkedProviders />, { wrapper: TestWrapper });

    const unlinkButton = screen.getByText('Unlink');
    expect(unlinkButton).toBeDisabled();
  });

  it('shows loading state during unlink', () => {
    (authService.unlinkID.useMutation as Mock).mockReturnValue([
      vi.fn(),
      { isLoading: true },
    ]);

    render(<LinkedProviders />, { wrapper: TestWrapper });

    const unlinkButton = screen.getAllByText('Unlink')[0];
    expect(unlinkButton).toContainHTML('fa-spinner');
  });

  it('renders the link provider form', () => {
    render(<LinkedProviders />, { wrapper: TestWrapper });

    expect(
      screen.getByText(
        'Link an additional sign-in account to this KBase account'
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId('linkForm')).toBeInTheDocument();
  });

  it('includes token input field in the link form', () => {
    render(<LinkedProviders />, { wrapper: TestWrapper });

    const tokenInput = screen.getByTestId('token');
    expect(tokenInput).toBeInTheDocument();
    expect(tokenInput).toHaveAttribute('name', 'token');
    expect(tokenInput).toHaveAttribute('value', 'test-token');
    expect(tokenInput).toHaveAttribute('hidden');
    expect(tokenInput).toHaveAttribute('readOnly');
  });

  it('handles link provider continuation flow', async () => {
    const mockLinkChoice = {
      provider: 'Google',
      idents: [{ id: '3', provusername: 'new@gmail.com' }],
      linked: [],
    };

    (authService.getLinkChoice.useQuery as Mock).mockReturnValue({
      data: mockLinkChoice,
    });

    const linkMock = vi.fn();
    (authService.postLinkPick.useMutation as Mock).mockReturnValue([
      linkMock,
      { isLoading: false },
    ]);

    render(<LinkedProviders isContinueRoute={true} />, {
      wrapper: TestWrapper,
    });

    await waitFor(() => {
      expect(linkMock).toHaveBeenCalledWith({
        token: 'test-token',
        id: '3',
      });
    });
  });

  it('shows error toast when provider is already linked', async () => {
    const mockToast = vi.fn();
    (toast as unknown as Mock).mockImplementation(mockToast);

    (authService.getLinkChoice.useQuery as Mock).mockReturnValue({
      data: {
        provider: 'Google',
        idents: [{ id: '3', provusername: 'existing@gmail.com' }],
        linked: [{ provusername: 'existing@gmail.com', user: 'other-user' }],
      },
    });

    render(<LinkedProviders isContinueRoute={true} />, {
      wrapper: TestWrapper,
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.stringContaining('Cannot link Google account')
      );
    });
  });
});
