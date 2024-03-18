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

  test('setParams accepts search param "q"', async () => {
    const store = createTestStore();
    const params = { q: 'abc', foo: 'bar' };
    const Component = () => {
      store.dispatch(setParams(params));
      return <></>;
    };
    render(
      <Provider store={store}>
        <Component />
      </Provider>
    );
    await waitFor(() => {
      expect(store.getState().params.q).toBe(params.q);
      expect(store.getState().params.foo).toBeUndefined();
    });
  });

  test('setParams accepts account management ui param "tab"', async () => {
    const store = createTestStore();
    const params = { tab: 'abc', foo: 'bar' };
    const Component = () => {
      store.dispatch(setParams(params));
      return <></>;
    };
    render(
      <Provider store={store}>
        <Component />
      </Provider>
    );
    await waitFor(() => {
      expect(store.getState().params.tab).toBe(params.tab);
      expect(store.getState().params.foo).toBeUndefined();
    });
  });

  test('setParams accepts narrative opening params "n" and "check"', async () => {
    const store = createTestStore();
    const params = { n: '123', check: 't', foo: 'bar' };
    const Component = () => {
      store.dispatch(setParams(params));
      return <></>;
    };
    render(
      <Provider store={store}>
        <Component />
      </Provider>
    );
    await waitFor(() => {
      expect(store.getState().params.n).toBe(params.n);
      expect(store.getState().params.check).toBe(params.check);
      expect(store.getState().params.foo).toBeUndefined();
    });
  });

  test('setParams accepts kbase-ui navigation params "nextrequest"', async () => {
    const store = createTestStore();
    const params = { nextrequest: 'some/where', source: 'baz', foo: 'bar' };
    const Component = () => {
      store.dispatch(setParams(params));
      return <></>;
    };
    render(
      <Provider store={store}>
        <Component />
      </Provider>
    );
    await waitFor(() => {
      expect(store.getState().params.nextrequest).toBe(params.nextrequest);
      expect(store.getState().params.source).toBe(params.source);
      expect(store.getState().params.foo).toBeUndefined();
    });
  });

  test('setParams accepts kbase-ui landing page params "sub" and "subid"', async () => {
    const store = createTestStore();
    const params = { sub: 'feature', subid: '123', foo: 'bar' };
    const Component = () => {
      store.dispatch(setParams(params));
      return <></>;
    };
    render(
      <Provider store={store}>
        <Component />
      </Provider>
    );
    await waitFor(() => {
      expect(store.getState().params.sub).toBe(params.sub);
      expect(store.getState().params.subid).toBe(params.subid);
      expect(store.getState().params.foo).toBeUndefined();
    });
  });

  test('setParams accepts orcidlink params', async () => {
    const store = createTestStore();
    const params = {
      skip_prompt: 'abc',
      ui_options: 'def',
      return_link: 'hij',
      code: 'jkl',
      message: 'mno',
      foo: 'bar',
    };
    const Component = () => {
      store.dispatch(setParams(params));
      return <></>;
    };
    render(
      <Provider store={store}>
        <Component />
      </Provider>
    );
    await waitFor(() => {
      expect(store.getState().params.skip_prompt).toBe(params.skip_prompt);
      expect(store.getState().params.ui_options).toBe(params.ui_options);
      expect(store.getState().params.return_link).toBe(params.return_link);
      expect(store.getState().params.code).toBe(params.code);
      expect(store.getState().params.message).toBe(params.message);
      expect(store.getState().params.foo).toBeUndefined();
    });
  });
});
