import { render, waitFor } from '@testing-library/react';
import fetchMock, { FetchMock } from 'jest-fetch-mock';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createTestStore } from '../../../app/store';
import { INITIAL_STORE_STATE } from '../test/data';
import { makeOrcidlinkServiceMock } from '../test/orcidlinkServiceMock';
import HomeController from './controller';

// We mock the sub-components because we don't really want to evaluate whether
// they work correctly, just that they are invoked.
jest.mock('../HomeLinked', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>Mocked Linked Component</div>;
    },
  };
});

jest.mock('../HomeUnlinked', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>Mocked UnLinked Component</div>;
    },
  };
});

describe('The HomeController Component', () => {
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

  it('renders mocked "Linked" component if user is linked', async () => {
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/x']}>
          <HomeController username="bar" />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(container).toHaveTextContent('Mocked Linked Component');
    });
  });

  it('renders "Unlinked" component if user is not linked', async () => {
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/foo']}>
          <HomeController username="foo" />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(container).toHaveTextContent('Mocked UnLinked Component');
    });
  });

  it('renders a parse error correctly', async () => {
    const { container } = render(
      <Provider store={createTestStore(INITIAL_STORE_STATE)}>
        <MemoryRouter initialEntries={['/x']}>
          <HomeController username="not_json" />
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
