import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  OrcidLink,
  OrcidLinkStatus,
  OrcidLinkContinue,
  OrcidLinkError,
} from './OrcidLink';
import {
  isLinked,
  getLinkingSession,
  ownerLink,
  deleteOwnLink,
} from '../../common/api/orcidlinkService';
import { mockQuery, mockMutation } from '../../test/mockRTKQuery';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@emotion/react';
import { MemoryRouter } from 'react-router-dom';
import { theme } from '../../theme';
import { createTestStore } from '../../app/store';

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider
      store={createTestStore({ auth: { username: 'foo', initialized: true } })}
    >
      <ThemeProvider theme={theme}>
        <MemoryRouter>{children}</MemoryRouter>
      </ThemeProvider>
    </Provider>
  );
};

describe('OrcidLink', () => {
  it('renders main layout with title and info button', () => {
    render(
      <TestWrapper>
        <OrcidLink />
      </TestWrapper>
    );

    expect(screen.getByText('OrcID Linking')).toBeInTheDocument();
    expect(screen.getByText('About this tab')).toBeInTheDocument();
  });
});

describe('OrcidLinkStatus', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows loader while checking link status', () => {
    mockQuery(isLinked, () => ({
      isLoading: true,
    }));

    render(
      <TestWrapper>
        <OrcidLinkStatus />
      </TestWrapper>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('shows unlinked state when no link exists', () => {
    mockQuery(isLinked, () => ({
      data: false,
    }));

    render(
      <TestWrapper>
        <OrcidLinkStatus />
      </TestWrapper>
    );

    expect(
      screen.getByText('Create Your KBase ORCID Link')
    ).toBeInTheDocument();
  });

  it('shows linked state with link info', () => {
    mockQuery(isLinked, () => ({
      data: true,
    }));

    mockQuery(ownerLink, () => ({
      data: {
        orcid_auth: {
          orcid: '0000-0002-1234-5678',
          name: 'Test User',
          scope: 'read-limited',
        },
        created_at: new Date('2023-01-01T00:00:00Z').getUTCDate(),
        expires_at: new Date('2024-01-01T00:00:00Z').getUTCDate(),
      },
    }));

    render(
      <TestWrapper>
        <OrcidLinkStatus />
      </TestWrapper>
    );

    expect(screen.getByText('Your KBase ORCID Link')).toBeInTheDocument();
    expect(
      screen.getByText('https://orcid.org/0000-0002-1234-5678')
    ).toBeInTheDocument();
  });

  it('handles unlink action', async () => {
    mockQuery(isLinked, () => ({
      data: true,
    }));

    mockQuery(ownerLink, () => ({
      data: {
        orcid_auth: {
          orcid: '0000-0002-1234-5678',
          name: 'Test User',
          scope: 'read-limited',
        },
      },
    }));

    const { triggerMock } = mockMutation(
      deleteOwnLink,
      { isLoading: false },
      () => ({ data: undefined })
    );

    render(
      <TestWrapper>
        <OrcidLinkStatus />
      </TestWrapper>
    );

    await act(() => userEvent.click(screen.getByText('Remove ORCID Link')));
    await waitFor(() =>
      expect(triggerMock).toBeCalledWith({
        username: 'foo',
        owner_username: 'foo',
      })
    );
  });
});

describe('OrcidLinkContinue', () => {
  it('shows linking session details', () => {
    mockQuery(getLinkingSession, () => ({
      data: {
        orcid_auth: {
          orcid: '0000-0002-1234-5678',
          name: 'Test User',
          scope: 'read-limited',
        },
        expires_at: Date.now() + 3600000, // 1 hour from now
      },
    }));

    render(
      <TestWrapper>
        <OrcidLinkContinue />
      </TestWrapper>
    );

    expect(screen.getByText('Confirm Pending Link')).toBeInTheDocument();
    expect(
      screen.getByText('https://orcid.org/0000-0002-1234-5678')
    ).toBeInTheDocument();
  });
});

describe('OrcidLinkError', () => {
  it('displays error information', () => {
    render(
      <TestWrapper>
        <OrcidLinkError />
      </TestWrapper>
    );

    expect(
      screen.getByText('An Error Occured During Linking')
    ).toBeInTheDocument();
    expect(screen.getByText('Return to OrcID Home')).toBeInTheDocument();
  });
});
