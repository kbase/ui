import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createTestStore } from '../../../app/store';
import ORCIDLinkAPI from '../common/api/ORCIDLInkAPI';
import { INITIAL_STORE_STATE } from '../test/data';
import CreateLinkController from './index';

/**
 * This set of tests focuses on artifically constructed error conditions. They
 * use a jest spy to mock api methods. It seems that jest, at least the version
 * in this codebase, does not or cannot reset the module level mocks, so these
 * tests need to be separated from the others.
 */

describe('The ConfirmLink controller component (api mocks for errors)', () => {
  beforeEach(() => {
    // jest.resetAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the expected error message if the loading api calls return a non-JSON-RPC error', async () => {
    // NB need to mock each call made, otherwise will get network errors in the
    // test output (though tests will still pass).
    // The calls are made in parallel (Promise.all), so there is no ensuring
    // which one is called or completes first and triggers the Promise.all
    // error. (Though in practice the first one, or perhaps the mocked one,
    // fails first, as it does not invoke an actual network call, which consumes
    // time.)
    jest
      .spyOn(ORCIDLinkAPI.prototype, 'getLinkingSession')
      .mockImplementation(async () => {
        throw new Error('Test Error');
      });

    jest.spyOn(ORCIDLinkAPI.prototype, 'info').mockImplementation(async () => {
      throw new Error('Test Error');
    });

    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter
          initialEntries={['/orcidlink/linkcontinue/foo_session_error_1']}
        >
          <Routes>
            <Route
              path="/orcidlink/linkcontinue/:sessionId"
              element={<CreateLinkController />}
            />{' '}
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(container).toHaveTextContent('Test Error');
    });
  });

  it('renders the expected error message if the loading api calls return a non-Error error', async () => {
    jest
      .spyOn(ORCIDLinkAPI.prototype, 'getLinkingSession')
      .mockImplementation(async () => {
        // eslint-disable-next-line no-throw-literal
        throw 'Not A Real Error';
      });

    jest.spyOn(ORCIDLinkAPI.prototype, 'info').mockImplementation(async () => {
      // eslint-disable-next-line no-throw-literal
      throw 'Not A Real Error';
    });

    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter
          initialEntries={['/orcidlink/linkcontinue/foo_session_error_1']}
        >
          <Routes>
            <Route
              path="/orcidlink/linkcontinue/:sessionId"
              element={<CreateLinkController />}
            />{' '}
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(container).toHaveTextContent('Unknown error');
    });
  });
});
