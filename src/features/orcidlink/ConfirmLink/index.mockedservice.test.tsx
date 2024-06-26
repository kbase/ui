import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'jest-fetch-mock';
import { FetchMock } from 'jest-fetch-mock/types';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createTestStore } from '../../../app/store';
import { JSONRPC20Request } from '../common/api/JSONRPC20';
import ORCIDLinkAPI from '../common/api/ORCIDLInkAPI';
import { INITIAL_STORE_STATE } from '../test/data';
import {
  makeError2,
  makeOrcidlinkServiceMock,
  orcidlinkErrors,
} from '../test/orcidlinkServiceMock';
import CreateLinkController from './index';

describe('The ConfirmLink controller component (without api spy)', () => {
  const user = userEvent.setup();
  let mockService: FetchMock;

  beforeEach(() => {
    fetchMock.enableMocks();
    mockService = makeOrcidlinkServiceMock();
  });
  afterEach(() => {
    mockService.mockClear();
    fetchMock.disableMocks();
    jest.clearAllMocks();
  });

  it('renders correctly if a linking session found', async () => {
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/orcidlink/linkcontinue/foo_session']}>
          <Routes>
            <Route
              path="/orcidlink/linkcontinue/:sessionId"
              element={<CreateLinkController />}
            />{' '}
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Whle calling "is-linked" this message is displayed and the continue
    // button is disabled.
    expect(container).toHaveTextContent('Loading Linking Session...');

    // Ensure the sections are all being displayed by checking for their titles.
    await waitFor(() => {
      expect(container).toHaveTextContent('Create Your KBase ORCID® Link');
    });
    expect(container).toHaveTextContent('Your ORCID® Account');
    expect(container).toHaveTextContent('Scopes being granted to KBase');
  });

  it('receives the cancel action', async () => {
    let fakeHomeCalled = false;

    function FakeHome() {
      fakeHomeCalled = true;
      return <div>ORCIDLINK HOME</div>;
    }

    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/orcidlink/linkcontinue/foo_session']}>
          <Routes>
            <Route
              path="/orcidlink/linkcontinue/:sessionId"
              element={<CreateLinkController />}
            />
            <Route path="/orcidlink" element={<FakeHome />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Whle calling "is-linked" this message is displayed and the continue
    // button is disabled.
    expect(container).toHaveTextContent('Loading Linking Session...');

    // Ensure the sections are all being displayed by checking for their titles.
    await waitFor(() => {
      expect(container).toHaveTextContent('Create Your KBase ORCID® Link');
    });
    expect(container).toHaveTextContent('Your ORCID® Account');
    expect(container).toHaveTextContent('Scopes being granted to KBase');

    // After the check reports "false", the view is rendered, with the continue button enabled.
    const cancelButton = await screen.findByText('Cancel');
    expect(cancelButton).toBeVisible();
    expect(cancelButton).toBeEnabled();

    await user.click(cancelButton);

    await waitFor(() => {
      expect(container).toHaveTextContent('ORCIDLINK HOME');
    });

    await waitFor(() => {
      expect(fakeHomeCalled).toBe(true);
    });
  });

  it('receives the finish action', async () => {
    let fakeHomeCalled = false;

    function FakeHome() {
      fakeHomeCalled = true;
      return <div>ORCIDLINK HOME</div>;
    }

    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/orcidlink/linkcontinue/foo_session']}>
          <Routes>
            <Route
              path="/orcidlink/linkcontinue/:sessionId"
              element={<CreateLinkController />}
            />
            <Route path="/orcidlink" element={<FakeHome />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Whle calling "is-linked" this message is displayed and the continue
    // button is disabled.
    expect(container).toHaveTextContent('Loading Linking Session...');

    // Ensure the sections are all being displayed by checking for their titles.
    await waitFor(() => {
      expect(container).toHaveTextContent('Create Your KBase ORCID® Link');
    });
    expect(container).toHaveTextContent('Your ORCID® Account');
    expect(container).toHaveTextContent('Scopes being granted to KBase');

    // After the check reports "false", the view is rendered, with the continue button enabled.
    // Ensure that the "Continue" button is displayed and can be clicked
    const continueButton = await screen.findByText(
      'Finish Creating Your KBase ORCID® Link'
    );
    expect(continueButton).toBeVisible();
    expect(continueButton).toBeEnabled();

    await user.click(continueButton);

    await waitFor(() => {
      expect(container).toHaveTextContent('ORCIDLINK HOME');
    });

    await waitFor(() => {
      expect(fakeHomeCalled).toBe(true);
    });
  });

  it('renders the expected error message if the session is expired', async () => {
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter
          initialEntries={['/orcidlink/linkcontinue/foo_session_expired']}
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

    // Whle calling "is-linked" this message is displayed and the continue
    // button is disabled.
    await waitFor(() => {
      expect(container).toHaveTextContent('Linking Session Expired');
    });
  });

  it('renders the expected error message if the loading api calls return a JSON-RPC error', async () => {
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
      expect(container).toHaveTextContent('Authorization Required');
    });
  });

  it('renders the expected error message if url called with an invalid session id', async () => {
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter
          initialEntries={['/orcidlink/linkcontinue/not_a_session']}
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
      expect(container).toHaveTextContent('1020');
      expect(container).toHaveTextContent(
        `The session id "not_a_session" does not exist`
      );
    });
  });

  it('handles an error when handling the cancel action', async () => {
    // Here we override the "foo_session" linking session mock to return an
    // error when delete-linking-session is called.
    // This ability to override mock implementations alleviates us from creating
    // special parameters for every possible scenario. We just have to create a
    // basic scenario, and then we can override individual api calls to simulate
    // errors, or other conditions.

    mockService.mockClear();
    fetchMock.disableMocks();
    mockService = makeOrcidlinkServiceMock({
      'delete-linking-session': {
        foo_session: ({ id, method, params }: JSONRPC20Request) => {
          // Force this call to return an auth error.
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return makeError2(id!, orcidlinkErrors['1010']);
        },
      },
    });
    fetchMock.enableMocks();
    fetchMock.doMock();

    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/orcidlink/linkcontinue/foo_session']}>
          <Routes>
            <Route
              path="/orcidlink/linkcontinue/:sessionId"
              element={<CreateLinkController />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Whle calling "is-linked" this message is displayed and the continue
    // button is disabled.
    expect(container).toHaveTextContent('Loading Linking Session...');

    // Ensure the sections are all being displayed by checking for their titles.
    await waitFor(() => {
      expect(container).toHaveTextContent('Create Your KBase ORCID® Link');
    });
    expect(container).toHaveTextContent('Your ORCID® Account');
    expect(container).toHaveTextContent('Scopes being granted to KBase');

    // After the check reports "false", the view is rendered, with the continue button enabled.
    const cancelButton = await screen.findByText('Cancel');
    expect(cancelButton).toBeVisible();
    expect(cancelButton).toBeEnabled();

    await user.click(cancelButton);

    await waitFor(() => {
      expect(container).toHaveTextContent('Authorization Required');
    });
  });

  it('handles an non-Error error when handling the cancel action', async () => {
    // Here we override the "foo_session" linking session mock to return an
    // error when delete-linking-session is called.
    // This ability to override mock implementations alleviates us from creating
    // special parameters for every possible scenario. We just have to create a
    // basic scenario, and then we can override individual api calls to simulate
    // errors, or other conditions.

    mockService.mockClear();
    fetchMock.disableMocks();
    mockService = makeOrcidlinkServiceMock({
      'delete-linking-session': {
        foo_session: ({ id, method, params }: JSONRPC20Request) => {
          // Force this call to return an auth error.
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return makeError2(id!, orcidlinkErrors['1010']);
        },
      },
    });
    fetchMock.enableMocks();
    fetchMock.doMock();

    jest
      .spyOn(ORCIDLinkAPI.prototype, 'deleteLinkingSession')
      .mockImplementation(async () => {
        // eslint-disable-next-line no-throw-literal
        throw 'Not A Real Error';
      });

    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/orcidlink/linkcontinue/foo_session']}>
          <Routes>
            <Route
              path="/orcidlink/linkcontinue/:sessionId"
              element={<CreateLinkController />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Whle calling "is-linked" this message is displayed and the continue
    // button is disabled.
    expect(container).toHaveTextContent('Loading Linking Session...');

    // Ensure the sections are all being displayed by checking for their titles.
    await waitFor(() => {
      expect(container).toHaveTextContent('Create Your KBase ORCID® Link');
    });
    expect(container).toHaveTextContent('Your ORCID® Account');
    expect(container).toHaveTextContent('Scopes being granted to KBase');

    // After the check reports "false", the view is rendered, with the continue button enabled.
    const cancelButton = await screen.findByText('Cancel');
    expect(cancelButton).toBeVisible();
    expect(cancelButton).toBeEnabled();

    await user.click(cancelButton);

    await waitFor(() => {
      expect(container).toHaveTextContent('Unknown error');
    });
  });

  it('handles an error when handling the finalization action', async () => {
    // Here we override the "foo_session" linking session mock to return an
    // error when delete-linking-session is called.
    // This ability to override mock implementations alleviates us from creating
    // special parameters for every possible scenario. We just have to create a
    // basic scenario, and then we can override individual api calls to simulate
    // errors, or other conditions.

    mockService.mockClear();
    fetchMock.disableMocks();
    mockService = makeOrcidlinkServiceMock({
      'finish-linking-session': {
        foo_session: ({ id, method, params }: JSONRPC20Request) => {
          // Force this call to return an auth error.
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return makeError2(id!, orcidlinkErrors['1010']);
        },
      },
    });
    fetchMock.enableMocks();
    fetchMock.doMock();

    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/orcidlink/linkcontinue/foo_session']}>
          <Routes>
            <Route
              path="/orcidlink/linkcontinue/:sessionId"
              element={<CreateLinkController />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Whle calling "is-linked" this message is displayed and the continue
    // button is disabled.
    expect(container).toHaveTextContent('Loading Linking Session...');

    // Ensure the sections are all being displayed by checking for their titles.
    await waitFor(() => {
      expect(container).toHaveTextContent('Create Your KBase ORCID® Link');
    });
    expect(container).toHaveTextContent('Your ORCID® Account');
    expect(container).toHaveTextContent('Scopes being granted to KBase');

    // After the check reports "false", the view is rendered, with the continue button enabled.
    const continueButton = await screen.findByText(
      'Finish Creating Your KBase ORCID® Link'
    );
    expect(continueButton).toBeVisible();
    expect(continueButton).toBeEnabled();

    await user.click(continueButton);

    await waitFor(() => {
      expect(container).toHaveTextContent('Authorization Required');
    });
  });

  it('handles an non-Error error when handling the finalization action', async () => {
    // Here we override the "foo_session" linking session mock to return an
    // error when delete-linking-session is called.
    // This ability to override mock implementations alleviates us from creating
    // special parameters for every possible scenario. We just have to create a
    // basic scenario, and then we can override individual api calls to simulate
    // errors, or other conditions.

    jest
      .spyOn(ORCIDLinkAPI.prototype, 'finishLinkingSession')
      .mockImplementation(async () => {
        // eslint-disable-next-line no-throw-literal
        throw 'Not A Real Error';
      });

    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/orcidlink/linkcontinue/foo_session']}>
          <Routes>
            <Route
              path="/orcidlink/linkcontinue/:sessionId"
              element={<CreateLinkController />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Whle calling "is-linked" this message is displayed and the continue
    // button is disabled.
    expect(container).toHaveTextContent('Loading Linking Session...');

    // Ensure the sections are all being displayed by checking for their titles.
    await waitFor(() => {
      expect(container).toHaveTextContent('Create Your KBase ORCID® Link');
    });
    expect(container).toHaveTextContent('Your ORCID® Account');
    expect(container).toHaveTextContent('Scopes being granted to KBase');

    // After the check reports "false", the view is rendered, with the continue button enabled.
    const continueButton = await screen.findByText(
      'Finish Creating Your KBase ORCID® Link'
    );
    expect(continueButton).toBeVisible();
    expect(continueButton).toBeEnabled();

    await user.click(continueButton);

    await waitFor(() => {
      expect(container).toHaveTextContent('Unknown error');
    });
  });
});
