import {
  render,
  // screen
  screen,
} from '@testing-library/react';
import fetchMock, {
  MockParams,
  disableFetchMocks,
  enableFetchMocks,
} from 'jest-fetch-mock';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import { createTestStore } from '../../app/store';
import { NarrativePreviewTemplate } from '../../stories/components/NarrativePreview.stories';
import { NarrativeDoc } from '../../common/types/NarrativeDoc';
import {
  initialTestState,
  initialTestStateFactory,
  testNarrativeDoc,
  testNarrativeDocsLookup,
} from './fixtures';
import NarrativeView from './NarrativeView';

const testResponseOKFactory = (
  narrativeDoc: NarrativeDoc
): [string, MockParams] => [
  JSON.stringify({
    jsonrpc: '2.0',
    result: [{ data: [{ data: narrativeDoc }] }],
  }),
  { status: 200 },
];

// eslint-disable-next-line @typescript-eslint/no-empty-function
// const emptyFunc = () => {};
// NOTE: In this suite we supresses console error, log and warn calls.
const consoleError = jest.spyOn(console, 'error');
const consoleLog = jest.spyOn(console, 'log');
const consoleWarn = jest.spyOn(console, 'warn');
// consoleError.mockImplementation(emptyFunc);
// consoleLog.mockImplementation(emptyFunc);
// consoleWarn.mockImplementation(emptyFunc);

describe('The <NarrativeView /> component...', () => {
  /* TODO: enable fetches for this suite
  beforeAll(() => {
    enableFetchMocks();
  });

  afterAll(() => {
    disableFetchMocks();
  });

  beforeEach(() => {
    fetchMock.resetMocks();
  });
  */

  test('renders.', () => {
    const { container } = render(
      <Provider store={createTestStore({ navigator: initialTestState })}>
        <Router>
          <NarrativeView narrativeUPA={'1/2/3'} view={'preview'} />
        </Router>
      </Provider>
    );
    expect(container).toBeTruthy();
    expect(container.querySelector('section.view')).toBeInTheDocument();
  });

  test('renders cells in the preview view.', () => {
    const initialState = initialTestStateFactory({
      cells: testNarrativeDoc.cells,
      cellsLoaded: true,
    });
    const wsId = testNarrativeDoc.access_group;
    const { container } = render(
      <Provider
        store={createTestStore({
          navigator: initialState,
        })}
      >
        <Router>
          <NarrativeView narrativeUPA={`${wsId}/2/3`} view={'preview'} />
        </Router>
      </Provider>
    );
    expect(container).toBeTruthy();
    expect(container.querySelector('section.view')).toBeInTheDocument();
  });

  test('renders the data view.', () => {
    const { container } = render(
      <Provider store={createTestStore({ navigator: initialTestState })}>
        <Router>
          <NarrativeView narrativeUPA={'1/2/3'} view={'data'} />
        </Router>
      </Provider>
    );
    expect(container).toBeTruthy();
    expect(container.querySelector('section.view')).toBeInTheDocument();
  });

  test('renders blank if narrative is not found.', () => {
    const wsId = 8675309;
    const { container } = render(
      <Provider store={createTestStore({ navigator: initialTestState })}>
        <Router>
          <NarrativeView narrativeUPA={`${wsId}/2/3`} view={'data'} />
        </Router>
      </Provider>
    );
    expect(wsId in testNarrativeDocsLookup).toBeFalsy();
    expect(container).toBeTruthy();
    expect(container.querySelector('section.view')).toBeInTheDocument();
  });

  // TODO: this test is not working. It should cause useCells to give an error
  // about a corrupt narrative, but does not seem to wait on the api query response.
  // see Navigator.test.tsx#L283
  test('warns if no cells are found in narrative.', () => {
    const narrativeDoc = initialTestState.narrativeDocs[0];
    fetchMock.mockResponses(testResponseOKFactory(narrativeDoc));
    console.log({ narrativeDoc }); // eslint-disable-line no-console
    const wsId = narrativeDoc.access_group;
    console.log('test begin render'); // eslint-disable-line no-console
    const testStore = createTestStore({ navigator: initialTestState });
    const { container } = render(
      <Provider store={testStore}>
        <Router>
          <NarrativeView narrativeUPA={`${wsId}/2/3`} view={'data'} />
        </Router>
      </Provider>
    );
    console.log('test end render'); // eslint-disable-line no-console
    screen.debug();
    expect(container).toBeTruthy();
    expect(container.querySelector('section.view')).toBeInTheDocument();
  });
  /*
   */
});

describe('The <NarrativePreview /> component...', () => {
  afterAll(() => {
    consoleError.mockRestore();
    consoleLog.mockRestore();
    consoleWarn.mockRestore();
  });

  beforeEach(() => {
    consoleError.mockClear();
    consoleLog.mockClear();
    consoleWarn.mockClear();
  });

  test('renders.', () => {
    const { container } = render(
      <Router>
        <NarrativePreviewTemplate
          cells={testNarrativeDoc.cells.slice(0, 16)}
          narrativeDoc={testNarrativeDoc}
          wsId={1}
        />
      </Router>
    );
    expect(container).toBeTruthy();
    expect(container.querySelector('section.preview')).toBeInTheDocument();
  });

  test('renders with no cells.', () => {
    const { container } = render(
      <Router>
        <NarrativePreviewTemplate
          cells={[]}
          narrativeDoc={testNarrativeDoc}
          wsId={1}
        />
      </Router>
    );
    expect(container).toBeTruthy();
    expect(container.querySelector('section.preview')).toBeInTheDocument();
  });

  test('renders with one more cell.', () => {
    const { container } = render(
      <Router>
        <NarrativePreviewTemplate
          cells={testNarrativeDoc.cells.slice(0, 17)}
          narrativeDoc={testNarrativeDoc}
          wsId={1}
        />
      </Router>
    );
    expect(container).toBeTruthy();
    expect(container.querySelector('section.preview')).toBeInTheDocument();
  });

  test('renders with more cells.', () => {
    const { container } = render(
      <Router>
        <NarrativePreviewTemplate
          narrativeDoc={testNarrativeDoc}
          cells={testNarrativeDoc.cells}
          wsId={1}
        />
      </Router>
    );
    expect(container).toBeTruthy();
    expect(container.querySelector('section.preview')).toBeInTheDocument();
  });
});
