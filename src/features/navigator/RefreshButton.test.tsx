import { act, render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createTestStore } from '../../app/store';
import { AUTOMATIC_REFRESH_DELAY } from './common';
import { initialTestStateFactory } from './fixtures';
import RefreshButton from './RefreshButton';
import { vi } from 'vitest';

// IT'S DANGEROUS TO GO ALONE! TAKE THIS.
// https://vitest.dev/guide/mocking.html#timers
// Use shouldAdvanceTime to allow waitFor's internal polling to work
vi.useFakeTimers({ shouldAdvanceTime: true });

const initialStateOutOfSync = initialTestStateFactory({ synchronized: false });
const initialStateStale = initialTestStateFactory({
  synchronized: false,
  synchronizedLast: Date.now() - 2 * AUTOMATIC_REFRESH_DELAY,
});

test('RefreshButton renders', () => {
  const { container } = render(
    <Provider store={createTestStore()}>
      <RefreshButton />
    </Provider>
  );
  expect(container).toBeTruthy();
  expect(container.querySelector('.button.refresh')).toBeInTheDocument();
});

test('RefreshButton warns when navigator is out of sync.', async () => {
  const { container } = await waitFor(() =>
    render(
      <Provider store={createTestStore({ navigator: initialStateOutOfSync })}>
        <RefreshButton />
      </Provider>
    )
  );
  expect(container).toBeTruthy();
  expect(container.querySelector('.button.refresh')).toBeInTheDocument();
});

test('RefreshButton refreshes automatically.', async () => {
  const { container } = await waitFor(() =>
    render(
      <Provider store={createTestStore({ navigator: initialStateStale })}>
        <RefreshButton />
      </Provider>
    )
  );
  expect(container).toBeTruthy();
  expect(container.querySelector('.button.refresh')).toBeInTheDocument();
  await act(async () => {
    await vi.runAllTimers();
  });
});
