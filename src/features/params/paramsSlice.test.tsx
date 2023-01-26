import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createTestStore } from '../../app/store';
import { setParams } from './paramsSlice';

describe('paramsSlice', () => {
  test('setParams ignores hooey parameters', async () => {
    const store = createTestStore();
    const Component = () => {
      // for great coverage
      store.dispatch(
        // @ts-expect-error setParams should ignore hooey parameters
        setParams({ hooey: 'fooey', search: 'taco' })
      );
      return <></>;
    };
    render(
      <Provider store={store}>
        <Component />
      </Provider>
    );
    await waitFor(() => {
      expect(store.getState().params.search).toBe('taco');
    });
  });
});
