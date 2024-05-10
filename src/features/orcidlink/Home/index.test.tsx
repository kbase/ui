import { act, render, waitFor } from '@testing-library/react';
import fetchMock, { MockResponseInit } from 'jest-fetch-mock';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createTestStore } from '../../../app/store';
import { setAuth } from '../../auth/authSlice';
import { INITIAL_STORE_STATE } from '../test/data';
import { mockIsLinked, mockIsLinked_not } from '../test/mocks';
import HomeController from './index';

jest.mock('../HomeLinked', () => {
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
        const { pathname } = new URL(request.url);
        switch (pathname) {
          case '/services/orcidlink/api/v1': {
            if (request.method !== 'POST') {
              return '';
            }
            const body = await request.json();
            switch (body['method']) {
              case 'is-linked': {
                return mockIsLinked(body);
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

    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/foo']}>
          <HomeController />
        </MemoryRouter>
      </Provider>
    );

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
                return mockIsLinked_not(body);
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

    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/foo']}>
          <HomeController />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(container).toHaveTextContent(
        'You do not currently have a link from your KBase account to an ORCID® account.'
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
          // MOcks for the orcidlink api
          case '/services/orcidlink/api/v1': {
            const body = await request.json();
            switch (body['method']) {
              case 'is-linked': {
                // In this mock, user "foo" is linked, user "bar" is not.
                return mockIsLinked(body);
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

    const testStore = createTestStore(INITIAL_STORE_STATE);

    const { container } = render(
      <Provider store={testStore}>
        <MemoryRouter initialEntries={['/foo']}>
          <HomeController />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(container).toHaveTextContent('Mocked Linked Component');
    });

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
      expect(container).toHaveTextContent(
        'You do not currently have a link from your KBase account to an ORCID® account.'
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

    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/foo']}>
          <HomeController />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(container).toHaveTextContent(
        `SyntaxError: Unexpected token 'b', "bad" is not valid JSON`
      );
    });
  });
});
