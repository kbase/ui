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

    mockQuery(getMe, {
      data: mockData,
    });

    TestWrapper(<TestQueryComponent />);

    const dataElement = screen.getByTestId('data');
    expect(dataElement).toHaveTextContent(JSON.stringify(mockData));
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });

  test('mockQuery handles error responses', async () => {
    const errorMessage = 'Not authorized';

    mockQuery(getMe, {
      error: { message: errorMessage },
      isError: true,
    });

    TestWrapper(<TestQueryComponent />);

    const errorElement = screen.getByTestId('error');
    expect(errorElement).toHaveTextContent(errorMessage);
    expect(screen.queryByTestId('data')).not.toBeInTheDocument();
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });

  test('mockQuery handles loading state', () => {
    mockQuery(getMe, {
      isLoading: true,
    });

    TestWrapper(<TestQueryComponent />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.queryByTestId('data')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();
  });

  test('mockMutation handles successful mutation', async () => {
    const mockData = { token: { token: 'test-token' } };
    mockMutation(loginCreate, {
      data: mockData,
    });

    TestWrapper(<TestMutationComponent />);

    const triggerButton = screen.getByTestId('trigger-button');
    fireEvent.click(triggerButton);

    await waitFor(() => {
      const dataElement = screen.getByTestId('mutation-data');
      expect(dataElement).toHaveTextContent(JSON.stringify(mockData));
    });
    expect(screen.queryByTestId('mutation-error')).not.toBeInTheDocument();
  });

  test('mockMutation handles error responses', async () => {
    const errorMessage = 'Invalid credentials';
    mockMutation(loginCreate, {
      error: { message: errorMessage },
    });

    TestWrapper(<TestMutationComponent />);

    const triggerButton = screen.getByTestId('trigger-button');
    fireEvent.click(triggerButton);

    await waitFor(() => {
      const errorElement = screen.getByTestId('mutation-error');
      expect(errorElement).toHaveTextContent(errorMessage);
    });
    expect(screen.queryByTestId('mutation-data')).not.toBeInTheDocument();
  });

  test('mockQuery updates subscribers when called multiple times', async () => {
    const initialData = { user: 'initial', id: 1 };
    mockQuery(getMe, { data: initialData });

    TestWrapper(<TestQueryComponent />);

    expect(screen.getByTestId('data')).toHaveTextContent(
      JSON.stringify(initialData)
    );

    // Update with new data
    const updatedData = { user: 'updated', id: 2 };
    mockQuery(getMe, { data: updatedData });

    // Should automatically update subscribers
    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent(
        JSON.stringify(updatedData)
      );
    });
  });

  test('mockQuery refetch functionality', async () => {
    const initialData = { user: 'initial', id: 1 };
    const mockFn = mockQuery(getMe, { data: initialData });

    TestWrapper(<TestQueryComponent />);

    expect(screen.getByTestId('data')).toHaveTextContent(
      JSON.stringify(initialData)
    );

    // Verify mock function was called
    expect(mockFn).toHaveBeenCalled();
  });

  test('mockMutation trigger returns expected data', async () => {
    const mockData = { token: { token: 'test-token' } };
    const { trigger } = mockMutation(loginCreate, {
      data: mockData,
    });

    // Test the trigger function directly
    const response = await trigger({ user: 'test', password: 'test' });
    expect(response.data).toEqual(mockData);
  });

  test('mockMutation trigger handles errors', async () => {
    const errorMessage = 'Invalid credentials';
    const { trigger } = mockMutation(loginCreate, {
      error: { message: errorMessage },
    });

    // Test the trigger function directly
    const response = await trigger({ user: 'test', password: 'test' });
    expect(response.error).toEqual({ message: errorMessage });
  });
});
