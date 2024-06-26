import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'jest-fetch-mock';
import { FetchMock } from 'jest-fetch-mock/types';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createTestStore } from '../../../app/store';
import { JSONRPC20Request } from '../common/api/JSONRPC20';
import ORCIDLinkAPI from '../common/api/ORCIDLInkAPI';
import { INITIAL_STORE_STATE, INITIAL_STORE_STATE_BAR } from '../test/data';
import {
  makeError2,
  makeOrcidlinkServiceMock,
  orcidlinkErrors,
} from '../test/orcidlinkServiceMock';
import CreateLinkController from './controller';

describe('The CreateLinkController component', () => {
  let windowOpenSpy: jest.SpyInstance;

  let mockService: FetchMock;

  const user = userEvent.setup();

  beforeEach(() => {
    fetchMock.enableMocks();
    fetchMock.doMock();
    mockService = makeOrcidlinkServiceMock();

    windowOpenSpy = jest
      .spyOn(window, 'open')
      // annoying to have to add a mock implementation; seems like a
      // simple option to disable calling the upstream implementation would
      // be so much easier.
      .mockImplementation(
        (
          url: string | URL | undefined,
          _1: string | undefined,
          _2: string | undefined
        ) => {
          // do nothing
          return null;
        }
      );
  });
  afterEach(() => {
    mockService.mockClear();
    fetchMock.disableMocks();

    jest.resetAllMocks();
  });

  it('renders correctly if not linked', async () => {
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/none']}>
          <Routes>
            <Route
              path="/none"
              element={
                <CreateLinkController
                  username={INITIAL_STORE_STATE.auth.username}
                  token={INITIAL_STORE_STATE.auth.token}
                />
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Whle calling "is-linked" this message is displayed and the continue
    // button is disabled.
    expect(container).toHaveTextContent(
      'Determining whether your account is already linked'
    );

    // After the check reports "false", the view is rendered, with the continue button enabled.
    const button = await screen.findByText('Continue to ORCID®');
    expect(button).toBeVisible();
    expect(button).toBeEnabled();
  });

  it('renders correctly if already linked', async () => {
    // We use the initial store state for user "bar", as we have configured the
    // mock orcidlink service above to respond that the "bar" user is linked.
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE_BAR)}>
        <MemoryRouter initialEntries={['/orcidlink/link']}>
          <Routes>
            <Route
              path="/orcidlink/link"
              element={
                <CreateLinkController
                  username={INITIAL_STORE_STATE_BAR.auth.username}
                  token={INITIAL_STORE_STATE_BAR.auth.token}
                />
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Whle calling "is-linked" this message is displayed and the continue
    // button is disabled.
    expect(container).toHaveTextContent(
      'Determining whether your account is already linked'
    );

    // After the check reports "false", the view is rendered, with the continue
    // button enabled.
    await waitFor(async () => {
      expect(container).toHaveTextContent('Already Linked');
    });
  });

  it('renders an error message if an Error is thrown by the api call', async () => {
    // We use the initial store state for user "bar", as we have configured the
    // mock orcidlink service above to respond that the "bar" user is linked.

    mockService.mockClear();
    fetchMock.disableMocks();
    mockService = makeOrcidlinkServiceMock({
      'is-linked': {
        foo: ({ id, method, params }: JSONRPC20Request) => {
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
        <MemoryRouter initialEntries={['/orcidlink/link']}>
          <Routes>
            <Route
              path="/orcidlink/link"
              element={
                <CreateLinkController
                  username={INITIAL_STORE_STATE.auth.username}
                  token={INITIAL_STORE_STATE.auth.token}
                />
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Whle calling "is-linked" this message is displayed and the continue
    // button is disabled.
    expect(container).toHaveTextContent(
      'Determining whether your account is already linked'
    );

    // After the check reports "false", the view is rendered, with the continue
    // button enabled.
    await waitFor(() => {
      expect(container).toHaveTextContent('Authorization Required');
    });
  });

  it('renders an error message if a non-Error is thrown by the api call', async () => {
    jest
      .spyOn(ORCIDLinkAPI.prototype, 'isLinked')
      .mockImplementation(async () => {
        // eslint-disable-next-line no-throw-literal
        throw 'Not A Real Error';
      });

    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/orcidlink/link']}>
          <Routes>
            <Route
              path="/orcidlink/link"
              element={
                <CreateLinkController
                  username={INITIAL_STORE_STATE.auth.username}
                  token={INITIAL_STORE_STATE.auth.token}
                />
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Whle calling "is-linked" this message is displayed and the continue
    // button is disabled.
    expect(container).toHaveTextContent(
      'Determining whether your account is already linked'
    );

    // After the check reports "false", the view is rendered, with the continue
    // button enabled.
    await waitFor(() => {
      expect(container).toHaveTextContent('Unknown error');
    });
  });

  it('responds as expected when the continue button is clicked', async () => {
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/orcidlink/link']}>
          <Routes>
            <Route
              path="/orcidlink/link"
              element={
                <CreateLinkController
                  username={INITIAL_STORE_STATE.auth.username}
                  token={INITIAL_STORE_STATE.auth.token}
                />
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Whle calling "is-linked" this message is displayed

    expect(container).toHaveTextContent(
      'Determining whether your account is already linked'
    );

    // After the check reports "false", the view is rendered, with the continue button enabled.
    const button = await screen.findByText('Continue to ORCID®');
    expect(button).toBeVisible();
    expect(button).toBeEnabled();

    await user.click(button);

    await waitFor(() => {
      expect(container).toHaveTextContent('Creating Linking Session');
    });

    await waitFor(() => {
      expect(container).toHaveTextContent('Linking Session Created');
    });

    await waitFor(() => {
      expect(windowOpenSpy).toHaveBeenCalled();
    });
  });
});
