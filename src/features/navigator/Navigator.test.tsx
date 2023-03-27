import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock, {
  MockParams,
  disableFetchMocks,
  enableFetchMocks,
} from 'jest-fetch-mock';
import { Provider } from 'react-redux';
import {
  Route,
  Routes as RRRoutes,
  MemoryRouter as Router,
} from 'react-router-dom';
import { createTestStore } from '../../app/store';
import Routes from '../../app/Routes';
import { baseApi } from '../../common/api';
import { usernameRequested } from '../common';
import { ignoredParameterWarning } from '../../common/hooks';
import { testItems } from './NarrativeList/NarrativeList.fixture';
import classes from './NarrativeList/NarrativeList.module.scss';
import { Category } from './common';
import Navigator, {
  narrativeSelectedPath,
  narrativeSelectedPathWithCategory,
} from './Navigator';

const initialState = {
  category: Category['own'],
  count: testItems.length,
  narratives: testItems,
  search_time: 0,
  selected: null,
};

let testStore = createTestStore({ navigator: initialState });

const consoleError = jest.spyOn(console, 'error');
// This mockImplementation supresses console.error calls.
// eslint-disable-next-line @typescript-eslint/no-empty-function
consoleError.mockImplementation(() => {});

const testItemResponseOK: [string, MockParams] = [
  JSON.stringify({
    jsonrpc: '2.0',
    result: {
      search_time: 1,
      count: testItems.length,
      hits: testItems,
    },
  }),
  { status: 200 },
];

describe('The <Navigator /> component...', () => {
  beforeAll(() => {
    enableFetchMocks();
  });

  afterAll(() => {
    consoleError.mockRestore();
    disableFetchMocks();
  });

  afterEach(() => {
    consoleError.mockClear();
  });

  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponses(testItemResponseOK);
    consoleError.mockClear();
    testStore = createTestStore({ navigator: initialState });
    testStore.dispatch(baseApi.util.resetApiState());
  });

  test('renders.', () => {
    const { container } = render(
      <Provider store={createTestStore()}>
        <Router>
          <Navigator />
        </Router>
      </Provider>
    );
    expect(container).toBeTruthy();
    expect(container.querySelector('section.navigator')).toBeInTheDocument();
  });

  test('may be refreshed manually.', async () => {
    const { container } = render(
      <Provider store={createTestStore()}>
        <Router>
          <Navigator />
        </Router>
      </Provider>
    );
    const refreshButton = screen.getByText('Refresh', {
      exact: false,
    });
    fetchMock.mockResponses(testItemResponseOK);
    await userEvent.click(refreshButton);
    expect(container).toBeTruthy();
    expect(container.querySelector('section.navigator')).toBeInTheDocument();
  });

  Object.keys(Category).forEach((category) => {
    test(`uses the '${category}' Category when specified.`, () => {
      const { container } = render(
        <Provider
          store={createTestStore({
            auth: { initialized: false, username: usernameRequested },
            navigator: initialState,
          })}
        >
          <Router initialEntries={[`/narratives/${category}/`]}>
            <RRRoutes>
              <Route path={'/narratives/:category'} element={<Navigator />} />
            </RRRoutes>
          </Router>
        </Provider>
      );
      expect(container).toBeTruthy();
    });
  });

  test('displays the narrative preview when specified.', () => {
    const { container } = render(
      <Provider store={createTestStore()}>
        <Router initialEntries={['/narratives/?view=preview']}>
          <RRRoutes>
            <Route path={'/narratives/'} element={<Navigator />} />
          </RRRoutes>
        </Router>
      </Provider>
    );
    expect(container).toBeTruthy();
  });

  test(`uses the 'own' Category when category is unknown.`, () => {
    const { container } = render(
      <Provider store={createTestStore()}>
        <Router initialEntries={['/narratives/hooey/']}>
          <RRRoutes>
            <Route path={'/narratives/:category'} element={<Navigator />} />
          </RRRoutes>
        </Router>
      </Provider>
    );
    expect(container).toBeTruthy();
  });

  test('identifies the selected narrative.', async () => {
    const { container } = render(
      <Provider
        store={createTestStore({
          auth: {
            initialized: false,
            username: usernameRequested,
          },
          navigator: {
            category: Category['tutorials'],
            count: testItems.length,
            narratives: testItems,
            search_time: 0,
            selected: null,
          },
        })}
      >
        <Router initialEntries={['/narratives/tutorials/10002/2/3']}>
          <RRRoutes>
            <Route
              path={narrativeSelectedPathWithCategory}
              element={<Navigator />}
            />
          </RRRoutes>
        </Router>
      </Provider>
    );
    expect(container).toBeTruthy();
    const consoleLog = jest.spyOn(console, 'log');
    consoleLog.mockImplementation(() => undefined);
    const control = container
      .getElementsByClassName(classes.version_dropdown)[0]
      .querySelector('.react-select__control');
    control && (await userEvent.click(control));
    const v2 = await screen.findByText('v2', { exact: false });
    v2 && (await userEvent.click(v2));
  });

  test('refuses to guess in the face of ambiguity.', () => {
    const { container } = render(
      <Provider store={createTestStore()}>
        <Router initialEntries={['/narratives/0/0/0']}>
          <RRRoutes>
            <Route path={narrativeSelectedPath} element={<Navigator />} />
          </RRRoutes>
        </Router>
      </Provider>
    );
    expect(container).toBeTruthy();
  });

  test('ignores hooey search parameters.', () => {
    const consoleLog = jest.spyOn(console, 'log');
    consoleLog.mockImplementation(() => undefined);
    const { container } = render(
      <Provider store={createTestStore()}>
        <Router initialEntries={['?hooey=fooey']}>
          <Routes />
        </Router>
      </Provider>
    );
    expect(container).toBeTruthy();
    expect(consoleLog).toHaveBeenCalledWith(ignoredParameterWarning(['hooey']));
  });

  test('suffers fools gladly.', () => {
    const { container } = render(
      <Provider store={testStore}>
        <Router initialEntries={['/narratives?sort=hooey']}>
          <RRRoutes>
            <Route path={'/narratives'} element={<Navigator />} />
          </RRRoutes>
        </Router>
      </Provider>
    );
    expect(container).toBeTruthy();
  });

  test('Europa assigns recognized search parameters.', () => {
    const { container } = render(
      <Provider store={testStore}>
        <Router initialEntries={['/narratives?search=taco']}>
          <RRRoutes>
            <Route path={'/narratives'} element={<Navigator />} />
          </RRRoutes>
        </Router>
      </Provider>
    );
    expect(container).toBeTruthy();
  });
});
