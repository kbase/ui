// Start a new test file for profileSlice specifically.
import { render, waitFor } from '@testing-library/react';
import { ErrorBoundary } from 'react-error-boundary';
import { Provider } from 'react-redux';

import { createTestStore } from '../../app/store';

import { useLoggedInProfileUser } from './profileSlice';

let testStore = createTestStore({});
describe('useLoggedInProfileUser', () => {
  beforeAll(() => {
    window.gtag = jest.fn();
  });

  beforeEach(() => {
    testStore = createTestStore({});
  });

  test('useLoggedInProfileUser sets loggedInProfile on success with valid username', async () => {
    const Component = () => {
      useLoggedInProfileUser('dlyon');
      return <></>;
    };
    render(
      <Provider store={testStore}>
        <Component />
      </Provider>
    );
    await waitFor(() =>
      expect(testStore.getState().profile.loggedInProfile?.user.username).toBe(
        'dlyon'
      )
    );
  });

  test('useLoggedInProfileUser throws error when called with invalid username', async () => {
    const onErr = jest.fn();
    const consoleError = jest.spyOn(console, 'error');
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    consoleError.mockImplementation(() => {});
    const Component = () => {
      useLoggedInProfileUser('!!!Iamnotause');
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
