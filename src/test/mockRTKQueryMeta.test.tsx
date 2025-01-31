import { ThemeProvider } from '@emotion/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { createTestStore } from '../app/store';
import { getMe, loginCreate } from '../common/api/authService';
import { parseError } from '../common/api/utils/parseError';
import { theme } from '../theme';
import { mockMutation, mockQuery } from './mockRTKQuery';

// Test wrapper component for providing necessary context
const TestWrapper = (
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

// Test component to display query results
const TestQueryComponent = () => {
  const result = getMe.useQuery({ token: '' });

  return (
    <div>
      {result.isLoading && <div data-testid="loading">Loading...</div>}
      {result.isError && (
        <div data-testid="error">{parseError(result.error).message}</div>
      )}
      {result.data && (
        <div data-testid="data">{JSON.stringify(result.data)}</div>
      )}
    </div>
  );
};

// Test component to display mutation results
const TestMutationComponent = () => {
  const [mutate, result] = loginCreate.useMutation();

  return (
    <div>
      <button
        data-testid="trigger-button"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onClick={() => mutate({ display: 'foobar' } as any)}
      >
        Trigger Mutation
      </button>
      {result.isError && (
        <div data-testid="mutation-error">
          {parseError(result.error).message}
        </div>
      )}
      {result.data && (
        <div data-testid="mutation-data">{JSON.stringify(result.data)}</div>
      )}
    </div>
  );
};

describe('RTK Query Mocking Tests', () => {
  test('mockQuery handles successful query responses', async () => {
    const mockData = { user: 'testUser', id: 1 };

    mockQuery(getMe, () => ({
      data: mockData,
    }));

    TestWrapper(<TestQueryComponent />);

    const dataElement = screen.getByTestId('data');
    expect(dataElement).toHaveTextContent(JSON.stringify(mockData));
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });

  test('mockQuery handles error responses', async () => {
    const errorMessage = 'Not authorized';

    mockQuery(getMe, () => ({
      error: { message: errorMessage },
      isError: true,
    }));

    TestWrapper(<TestQueryComponent />);

    const errorElement = screen.getByTestId('error');
    expect(errorElement).toHaveTextContent(errorMessage);
    expect(screen.queryByTestId('data')).not.toBeInTheDocument();
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });

  test('mockQuery handles loading state', () => {
    mockQuery(getMe, () => ({
      isLoading: true,
    }));

    TestWrapper(<TestQueryComponent />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.queryByTestId('data')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });

  test('mockMutation handles successful mutation', async () => {
    const mockData = { token: { token: 'test-token' } };

    // Simplified mock setup
    mockMutation(
      loginCreate,
      { isLoading: false }, // initial state
      () => {
        return { data: mockData, isSuccess: true };
      } // callback state
    );

    TestWrapper(<TestMutationComponent />);

    const triggerButton = screen.getByTestId('trigger-button');
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByTestId('mutation-data')).toHaveTextContent(
        JSON.stringify(mockData)
      );
    });
  });
  test('mockMutation handles loading state', async () => {
    mockMutation(loginCreate, { isLoading: false }, () => ({
      isLoading: true,
    }));

    TestWrapper(<TestMutationComponent />);

    const triggerButton = screen.getByTestId('trigger-button');
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.queryByTestId('mutation-data')).not.toBeInTheDocument();
      expect(screen.queryByTestId('mutation-error')).not.toBeInTheDocument();
    });
  });

  test('mockMutation handles error state', async () => {
    const errorMessage = 'Authentication failed';

    mockMutation(loginCreate, { isLoading: false }, () => ({
      error: { message: errorMessage },
      isError: true,
    }));

    TestWrapper(<TestMutationComponent />);

    const triggerButton = screen.getByTestId('trigger-button');
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.getByTestId('mutation-error')).toHaveTextContent(
        errorMessage
      );
      expect(screen.queryByTestId('mutation-data')).not.toBeInTheDocument();
    });
  });

  test('mockMutation handles state transitions', async () => {
    let currentState = { isLoading: false };

    mockMutation(loginCreate, currentState, () => {
      currentState = { isLoading: true };
      return currentState;
    });

    TestWrapper(<TestMutationComponent />);

    const triggerButton = screen.getByTestId('trigger-button');
    fireEvent.click(triggerButton);

    await waitFor(() => {
      expect(screen.queryByTestId('mutation-data')).not.toBeInTheDocument();
      expect(screen.queryByTestId('mutation-error')).not.toBeInTheDocument();
    });
  });

  test('mockMutation reset functionality', async () => {
    const mockData = { token: { token: 'test-token' } };

    const { resetFromTest } = mockMutation(
      loginCreate,
      { isLoading: false },
      () => ({
        data: mockData,
        isSuccess: true,
      })
    );

    TestWrapper(<TestMutationComponent />);

    // Trigger the mutation by clicking the button
    const triggerButton = screen.getByTestId('trigger-button');
    fireEvent.click(triggerButton);

    // Wait for the mutation data to appear
    await waitFor(() => {
      expect(screen.getByTestId('mutation-data')).toHaveTextContent(
        JSON.stringify(mockData)
      );
    });

    // Call reset
    resetFromTest();

    // Verify the mutation state has been cleared
    await waitFor(() => {
      expect(screen.queryByTestId('mutation-data')).not.toBeInTheDocument();
      expect(screen.queryByTestId('mutation-error')).not.toBeInTheDocument();
    });
  });

  test('mockMutation cleanup on unmount', async () => {
    const mockData = { token: { token: 'test-token' } };

    mockMutation(loginCreate, { isLoading: false }, () => ({
      data: mockData,
      isSuccess: true,
    }));

    const { unmount } = TestWrapper(<TestMutationComponent />);

    // Trigger the mutation
    const triggerButton = screen.getByTestId('trigger-button');
    fireEvent.click(triggerButton);

    // Wait for the data to appear
    await waitFor(() => {
      expect(screen.getByTestId('mutation-data')).toBeInTheDocument();
    });

    // Unmount the component
    unmount();

    // Verify cleanup (this is mostly for coverage as the effects are internal)
    expect(screen.queryByTestId('mutation-data')).not.toBeInTheDocument();
  });

  test('mockMutation can be triggered from within a test', async () => {
    const mockData = { token: { token: 'test-token' } };

    const { triggerFromTest } = mockMutation(
      loginCreate,
      { isLoading: false },
      () => ({
        data: mockData,
        isSuccess: true,
      })
    );

    TestWrapper(<TestMutationComponent />);

    // Trigger the mutation directly from the test
    await triggerFromTest({ display: 'test-user' });

    // Verify the component updated with the mock data
    await waitFor(() => {
      expect(screen.getByTestId('mutation-data')).toHaveTextContent(
        JSON.stringify(mockData)
      );
    });
  });
});
