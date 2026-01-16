import { render, waitFor } from '@testing-library/react';
import createFetchMock from 'vitest-fetch-mock';
import type { FetchMock } from 'vitest-fetch-mock';
import { vi } from 'vitest';
import { Provider } from 'react-redux';
import { createTestStore } from '../../app/store';
import { makeKBaseServices } from '../../test/kbaseServiceMock';
import { useLoggedInProfileUser } from './profileSlice';

const fetchMock = createFetchMock(vi);

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
});
