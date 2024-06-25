import { render, waitFor } from '@testing-library/react';
import fetchMock, { FetchMock, MockResponseInit } from 'jest-fetch-mock';
import { ErrorBoundary } from 'react-error-boundary';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import HomeEntrypoint from '.';
import { createTestStore } from '../../../app/store';
import {
  INITIAL_STORE_STATE,
  INITIAL_STORE_STATE_BAR,
  INITIAL_UNAUTHENTICATED_STORE_STATE,
} from '../test/data';
import { makeOrcidlinkServiceMock } from '../test/orcidlinkServiceMock';

jest.mock('../HomeLinked', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>Mocked Linked Component</div>;
    },
  };
});

describe('The HomeEntrypoint Component', () => {
  let mockService: FetchMock;

  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.enableMocks();
    mockService = makeOrcidlinkServiceMock();
  });

  afterEach(() => {
    mockService.mockClear();
    fetchMock.disableMocks();
  });

  /**
   * The INITIAL_STORE_STATE for orcidlink tests establishes authentication for
   * user "bar", who does have a link.
   */
  it('renders mocked "Linked" component if user is linked', async () => {
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE_BAR)}>
        <MemoryRouter initialEntries={['/x']}>
          <HomeEntrypoint />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(container).toHaveTextContent('Mocked Linked Component');
    });
  });

  /**
   * The INITIAL_STORE_STATE for orcidlink tests establishes authentication for
   * user "foo", who does not have a link.
   */
  it('renders "Unlinked" component if user is not linked', async () => {
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/foo']}>
          <HomeEntrypoint />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(container).toHaveTextContent(
        'You do not currently have a link from your KBase account to an ORCID® account.'
      );
    });
  });

  it('renders a parse error correctly', async () => {
    // Note that we use a custom response here, in order to trigger an error. We
    // could use another technique to utilize the same response for user
    // "not_json". I've left this here as an example of one-off mocks.

    fetchMock.mockResponseOnce(
      async (request): Promise<MockResponseInit | string> => {
        if (request.method !== 'POST') {
          return '';
        }
        const { pathname } = new URL(request.url);
        switch (pathname) {
          case '/services/orcidlink/api/v1': {
            const body = await request.json();
            switch (body['method']) {
              case 'is-linked': {
                return {
                  body: 'bad',
                  status: 200,
                  headers: {
                    'content-type': 'application/json',
                  },
                };
              }
              default:
                return '';
            }
          }
          default:
            return '';
        }
      }
    );

    const initialState = structuredClone(INITIAL_STORE_STATE);

    // Apropos of the comment above, this line would switch the user in auth
    // state to "not_json", which in orcidlinkServiceMock.ts is programmed to
    // return an erroneous response body, just like above.
    // initialState.auth.username = 'not_json';

    const { container } = render(
      <Provider store={createTestStore(initialState)}>
        <MemoryRouter initialEntries={['/x']}>
          <HomeEntrypoint />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(container).toHaveTextContent(
        `SyntaxError: Unexpected token 'b', "bad" is not valid JSON`
      );
    });
  });

  it('throws an impossible error if called without authentication', async () => {
    const { container } = render(
      <ErrorBoundary
        fallbackRender={({ error }) => {
          return <div>{error.message}</div>;
        }}
      >
        <Provider store={createTestStore(INITIAL_UNAUTHENTICATED_STORE_STATE)}>
          <MemoryRouter initialEntries={['/foo']}>
            <HomeEntrypoint />
          </MemoryRouter>
        </Provider>
      </ErrorBoundary>
    );

    await waitFor(() => {
      expect(container).toHaveTextContent(
        'Impossible - username is not defined'
      );
    });
  });
});
