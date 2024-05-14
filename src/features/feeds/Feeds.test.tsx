import { render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import { createTestStore } from '../../app/store';
import Feeds from './Feeds';
import fetchMock, {
  disableFetchMocks,
  enableFetchMocks,
} from 'jest-fetch-mock';
import { basicFeedsResponseOk } from './fixtures';
import { FC } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

const TestingError: FC<FallbackProps> = ({ error }) => {
  return <>Error: {JSON.stringify(error)}</>;
};

const logError = (error: Error, info: { componentStack: string }) => {
  console.log({ error }); // eslint-disable-line no-console
  console.log(info.componentStack); // eslint-disable-line no-console
  screen.debug();
};

describe('The <Feeds /> component', () => {
  beforeAll(() => {
    enableFetchMocks();
  });

  afterAll(() => {
    disableFetchMocks();
  });

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test('renders.', async () => {
    const store = createTestStore();
    const { container } = await waitFor(() =>
      render(
        <Provider store={store}>
          <Router>
            <ErrorBoundary FallbackComponent={TestingError} onError={logError}>
              <Feeds />
            </ErrorBoundary>
          </Router>
        </Provider>
      )
    );
    expect(container).toBeTruthy();
    await waitFor(() => {
      expect(store.getState().layout.pageTitle).toBe('Notification Feeds');
    });
  });

  test('renders element for each feed', async () => {
    enableFetchMocks();
    const feedsList = {
      user: 'SomeUser',
      global: 'KBase',
      test1: 'Test Feed',
    };
    const resp = basicFeedsResponseOk(feedsList);
    fetchMock.mockResponses(resp);
    const { container } = await waitFor(() =>
      render(
        <Provider store={createTestStore()}>
          <Router>
            <ErrorBoundary FallbackComponent={TestingError} onError={logError}>
              <Feeds />
            </ErrorBoundary>
          </Router>
        </Provider>
      )
    );
    expect(container).toBeTruthy();
    // check we have announcements, user, and Test Feed, in that order
    const feedLabels = within(container).getAllByText(
      /KBase Announcements|SomeUser|Test Feed/
    );
    expect(feedLabels[0]).toHaveTextContent('KBase Announcements');
    expect(feedLabels[1]).toHaveTextContent('SomeUser');
    expect(feedLabels[2]).toHaveTextContent('Test Feed');
    disableFetchMocks();
  });
});
