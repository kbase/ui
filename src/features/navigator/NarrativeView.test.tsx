import { render, screen, waitFor } from '@testing-library/react';
import fetchMock, {
  MockParams,
  disableFetchMocks,
  enableFetchMocks,
} from 'jest-fetch-mock';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import { createTestStore } from '../../app/store';
import { NarrativePreviewTemplate } from '../../stories/components/NarrativePreview.stories';
import { testResponseOKFactory } from './common';
import {
  initialTestState,
  testNarrativeDoc,
  testNarrativeDocsLookup,
} from './fixtures';
import NarrativeView, {
  noPreviewMessage,
  noWorkspaceCellsMessage,
} from './NarrativeView';

const testResponseError: [string, MockParams] = [
  JSON.stringify({
    version: '2.0',
    error: {
      name: 'JSONRPCError',
      code: -32500,
      message:
        'Object 1 cannot be accessed: No workspace with id 8675309 exists',
      error: [
        'us.kbase.workspace.database.exceptions.InaccessibleObjectException: ',
        'Object 1 cannot be accessed: No workspace with id 8675309 exists',
      ].join(''),
    },
  }),
  { status: 500 },
];

// eslint-disable-next-line @typescript-eslint/no-empty-function
const emptyFunc = () => {};
// NOTE: In this suite we supresses console error, log and warn calls.
const consoleError = jest.spyOn(console, 'error');
const consoleLog = jest.spyOn(console, 'log');
const consoleWarn = jest.spyOn(console, 'warn');
consoleError.mockImplementation(emptyFunc);
consoleLog.mockImplementation(emptyFunc);
consoleWarn.mockImplementation(emptyFunc);

describe('The <NarrativeView /> component...', () => {
  beforeAll(() => {
    enableFetchMocks();
  });

  afterAll(() => {
    disableFetchMocks();
  });

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test('renders.', async () => {
    fetchMock.mockResponses(testResponseOKFactory(testNarrativeDoc));
    const { container } = await waitFor(() =>
      render(
        <Provider store={createTestStore({ navigator: initialTestState })}>
          <Router>
            <NarrativeView narrativeUPA={'1/2/3'} view={'preview'} />
          </Router>
        </Provider>
      )
    );
    expect(container).toBeTruthy();
    expect(container.querySelector('section.view')).toBeInTheDocument();
  });

  test('renders the data view.', async () => {
    fetchMock.mockResponses(testResponseOKFactory(testNarrativeDoc));
    const initialState = initialTestState;
    const wsId = testNarrativeDoc.access_group;
    const { container } = await waitFor(() =>
      render(
        <Provider
          store={createTestStore({
            navigator: initialState,
          })}
        >
          <Router>
            <NarrativeView narrativeUPA={`${wsId}/2/3`} view={'data'} />
          </Router>
        </Provider>
      )
    );
    expect(container).toBeTruthy();
    expect(container.querySelector('section.view')).toBeInTheDocument();
  });

  test('renders blank if narrative is not found.', async () => {
    const wsId = 8675309;
    fetchMock.mockResponses(testResponseError);
    const { container } = await waitFor(() =>
      render(
        <Provider store={createTestStore({ navigator: initialTestState })}>
          <Router>
            <NarrativeView narrativeUPA={`${wsId}/2/3`} view={'data'} />
          </Router>
        </Provider>
      )
    );
    expect(wsId in testNarrativeDocsLookup).toBeFalsy();
    expect(container).toBeTruthy();
    expect(container.querySelector('section.view')).toBeInTheDocument();
  });

  test('warns if no cells are found in narrative.', async () => {
    const narrativeDoc = initialTestState.narrativeDocs[0];
    fetchMock.mockResponses(testResponseOKFactory(narrativeDoc));
    const wsId = narrativeDoc.access_group;
    const testStore = createTestStore({ navigator: initialTestState });
    const { container } = await waitFor(() =>
      render(
        <Provider store={testStore}>
          <Router>
            <NarrativeView narrativeUPA={`${wsId}/2/3`} view={'preview'} />
          </Router>
        </Provider>
      )
    );
    expect(container).toBeTruthy();
    expect(container.querySelector('section.preview')).toBeInTheDocument();
    expect(
      screen.getByText(noPreviewMessage, {
        exact: false,
      })
    );
    const lastCallArg = consoleLog.mock.lastCall
      ? consoleLog.mock.lastCall[0]
      : '';
    expect(lastCallArg).toBe(noWorkspaceCellsMessage);
  });
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
