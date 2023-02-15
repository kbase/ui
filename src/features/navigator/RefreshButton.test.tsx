import { fireEvent, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createTestStore } from '../../app/store';
import type { AppDispatch } from '../../app/store';
import RefreshButton, { refreshHandlerFactory } from './RefreshButton';

test('RefreshButton renders', () => {
  const { container } = render(
    <Provider store={createTestStore()}>
      <RefreshButton />
    </Provider>
  );
  expect(container).toBeTruthy();
  expect(container.querySelector('.button.refresh')).toBeInTheDocument();
});

test('RefreshButton executes handler when clicked.', () => {
  const store = createTestStore();
  const spy = jest.fn();
  const clickHandlerFactory = (dispatch: AppDispatch) => () => {
    spy();
    refreshHandlerFactory(dispatch)();
  };
  const { container } = render(
    <Provider store={store}>
      <RefreshButton clickHandlerFactory={clickHandlerFactory} />
    </Provider>
  );
  const refreshButton = container.querySelector('.button.refresh');
  refreshButton && fireEvent.click(refreshButton);
  expect(spy).toHaveBeenCalledTimes(1);
});
