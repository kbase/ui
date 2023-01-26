import { fireEvent, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createTestStore } from '../../app/store';
import { Category } from './common';
import RefreshButton from './RefreshButton';

const initialFreshState = {
  category: Category['own'],
  fresh: true,
  narratives: [],
  selected: null,
};

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
  const store = createTestStore({ navigator: initialFreshState });
  const { container } = render(
    <Provider store={store}>
      <RefreshButton />
    </Provider>
  );
  const refreshButton = container.querySelector('.button.refresh');
  refreshButton && fireEvent.click(refreshButton);
  expect(store.getState().navigator.fresh).toBeFalsy();
});
