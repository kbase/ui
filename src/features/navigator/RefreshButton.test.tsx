import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createTestStore } from '../../app/store';
import RefreshButton from './RefreshButton';

test('RefreshButton renders', () => {
  const { container } = render(
    <Provider store={createTestStore()}>
      <RefreshButton />
    </Provider>
  );
  expect(container).toBeTruthy();
  const Refresh = screen.getByText(/Refresh/, { exact: false });
  screen.debug();
  expect(Refresh).toBeInTheDocument();
});
