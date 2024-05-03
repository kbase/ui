import { act, render, waitFor } from '@testing-library/react';
import fetchMock, { MockResponseInit } from 'jest-fetch-mock';
import { Provider } from 'react-redux';
import { createTestStore } from '../../../app/store';
import { setAuth } from '../../auth/authSlice';
import LinkedController from './index';

// const TEST_LINK_RECORD_FOO: LinkRecordPublic = {
//   username: 'foo',
//   created_at: 123,
//   expires_at: 456,
//   retires_at: 789,
//   orcid_auth: {
//     name: 'Foo',
//     orcid: 'abc123',
//     scope: 'baz',
//     expires_in: 100,
//   },
// };

// const TEST_LINK_RECORD_BAR: LinkRecordPublic = {
//   username: 'bar',
//   created_at: 123,
//   expires_at: 456,
//   retires_at: 789,
//   orcid_auth: {
//     name: 'Bar',
//     orcid: 'xyz123',
//     scope: 'baz',
//     expires_in: 100,
//   },
// };

jest.mock('../Linked', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>Mocked Linked Component</div>;
    },
  };
});

describe('The HomeController Component', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.enableMocks();
  });

  it('renders mocked "Linked" component if user is linked', async () => {
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
                const result = (() => {
                  const username = body['params']['username'];
                  switch (username) {
                    case 'foo':
                      return true;
                    case 'bar':
                      return false;
                  }
                })();
                return {
                  body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: body['id'],
                    result,
                  }),
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

    const initialStoreState = {
      auth: {
        token: 'xyz123',
        username: 'foo',
        tokenInfo: {
          created: 123,
          expires: 456,
          id: 'abc123',
          name: 'Foo Bar',
          type: 'Login',
          user: 'foo',
          cachefor: 890,
        },
        initialized: true,
      },
    };

    const { container } = render(
      <Provider store={createTestStore(initialStoreState)}>
        <LinkedController />
      </Provider>
    );

    await waitFor(() => {
      expect(container).toHaveTextContent('Loading...');
    });

    await waitFor(() => {
      expect(container).toHaveTextContent('Mocked Linked Component');
    });
  });

  it('renders "Unlinked" component if user is not linked', async () => {
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
                  body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: body['id'],
                    result: false,
                  }),
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

    const initialStoreState = {
      auth: {
        token: 'xyz123',
        username: 'bar',
        tokenInfo: {
          created: 123,
          expires: 456,
          id: 'abc123',
          name: 'Bar Baz',
          type: 'Login',
          user: 'bar',
          cachefor: 890,
        },
        initialized: true,
      },
    };

    const { container } = render(
      <Provider store={createTestStore(initialStoreState)}>
        <LinkedController />
      </Provider>
    );

    await waitFor(() => {
      expect(container).toHaveTextContent('Loading...');
    });

    await waitFor(() => {
      expect(container).toHaveTextContent(
        'Your KBase account is not linked to an ORCID account.'
      );
    });
  });

  it('re-renders correctly', async () => {
    fetchMock.mockResponse(
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
                const result = (() => {
                  const username = body['params']['username'];
                  switch (username) {
                    case 'foo':
                      return true;
                    case 'bar':
                      return false;
                  }
                })();
                return {
                  body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: body['id'],
                    result,
                  }),
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

    const initialStoreState = {
      auth: {
        token: 'abc123',
        username: 'foo',
        tokenInfo: {
          created: 123,
          expires: 456,
          id: 'abc123',
          name: 'Foo Bar',
          type: 'Login',
          user: 'foo',
          cachefor: 890,
        },
        initialized: true,
      },
    };

    const testStore = createTestStore(initialStoreState);

    const { container } = render(
      <Provider store={testStore}>
        <LinkedController />
      </Provider>
    );

    await waitFor(() => {
      expect(container).toHaveTextContent('Loading...');
    });

    await waitFor(() => {
      expect(container).toHaveTextContent('Mocked Linked Component');
    });

    // initialStoreState.auth.username = 'bar';

    act(() => {
      testStore.dispatch(
        setAuth({
          token: 'xyz123',
          username: 'bar',
          tokenInfo: {
            created: 123,
            expires: 456,
            id: 'xyz123',
            name: 'Bar Baz',
            type: 'Login',
            user: 'bar',
            cachefor: 890,
          },
        })
      );
    });

    await waitFor(() => {
      expect(container).toHaveTextContent('Fetching...');
    });

    await waitFor(() => {
      expect(container).toHaveTextContent(
        'Your KBase account is not linked to an ORCID account.'
      );
    });
  });

  it('renders a parse error correctly', async () => {
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

    const initialStoreState = {
      auth: {
        token: 'xyz123',
        username: 'foo',
        tokenInfo: {
          created: 123,
          expires: 456,
          id: 'abc123',
          name: 'Foo Bar',
          type: 'Login',
          user: 'foo',
          cachefor: 890,
        },
        initialized: true,
      },
    };

    const { container } = render(
      <Provider store={createTestStore(initialStoreState)}>
        <LinkedController />
      </Provider>
    );

    await waitFor(() => {
      expect(container).toHaveTextContent(
        `SyntaxError: Unexpected token 'b', "bad" is not valid JSON`
      );
    });
  });
});
