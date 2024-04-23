import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import { createTestStore } from '../../app/store';
import Feeds from './Feeds';

test('Feeds renders', async () => {
  const store = createTestStore();
  const { container } = render(
    <Provider store={store}>
      <Router>
        <Feeds />
      </Router>
    </Provider>
  );
  expect(container).toBeTruthy();
  expect(screen.getByText(/Feeds/, { exact: false })).toBeInTheDocument();
  await waitFor(() => {
    expect(store.getState().layout.pageTitle).toBe('Notification Feeds');
  });
});
