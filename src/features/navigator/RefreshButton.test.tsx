import { fireEvent, render } from '@testing-library/react';
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
  expect(container.querySelector('.button.refresh')).toBeInTheDocument();
});

test('RefreshButton sets fresh to false when clicked', () => {
  const store = createTestStore({ navigator: { fresh: true } });
  const { container } = render(
    <Provider store={store}>
      <RefreshButton />
    </Provider>
  );
  fireEvent.click(container.querySelector('.button.refresh'));
  expect(store.getState().navigator.fresh).toBeFalsy();
});
