import { render, waitFor } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import { FetchMock } from 'jest-fetch-mock/types';
import { ErrorBoundary } from 'react-error-boundary';
import { Provider } from 'react-redux';
import { createTestStore } from '../../app/store';
import { makeKBaseServices } from '../../test/kbaseServiceMock';
import { useLoggedInProfileUser } from './profileSlice';

let testStore = createTestStore({});

describe('useLoggedInProfileUser', () => {
  let mockService: FetchMock;

  beforeEach(() => {
    testStore = createTestStore({});
    fetchMock.enableMocks();
    mockService = makeKBaseServices();
  });

  afterEach(() => {
    mockService.mockClear();
    fetchMock.disableMocks();
  });

  test('sets loggedInProfile on success with valid username', async () => {
    const Component = () => {
      useLoggedInProfileUser('kbaseuitest');
      return <></>;
    };
    render(
      <Provider store={testStore}>
        <Component />
      </Provider>
    );
    await waitFor(() =>
      expect(testStore.getState().profile.loggedInProfile?.user.username).toBe(
        'kbaseuitest'
      )
    );
  });

  test('throws error when called with invalid username', async () => {
    const onErr = jest.fn();
    const consoleError = jest.spyOn(console, 'error');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    consoleError.mockImplementation(() => {});
    const Component = () => {
      useLoggedInProfileUser('not_a_user');
      return <></>;
    };
    render(
      <ErrorBoundary fallback={<></>} onError={onErr}>
        <Provider store={testStore}>
          <Component />
        </Provider>
      </ErrorBoundary>
    );
    await waitFor(() => {
      expect(onErr).toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalled();
    });
    expect(testStore.getState().profile.loggedInProfile?.user.username).toBe(
      undefined
    );
    consoleError.mockRestore();
  });
});
