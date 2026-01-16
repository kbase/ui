import { render, screen, waitFor } from '@testing-library/react';
import createFetchMock from 'vitest-fetch-mock';
import type { MockParams } from 'vitest-fetch-mock';
import { vi } from 'vitest';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import { createTestStore } from '../../app/store';
import { noOp } from '../common';
import {
  initialTestState,
  testNarrativeDoc,
  testNarrativeDocsLookup,
  testResponseOKFactory,
} from './fixtures';
import NarrativeView, {
  NarrativePreview,
  noPreviewMessage,
  noWorkspaceCellsMessage,
} from './NarrativeView';

const fetchMock = createFetchMock(vi);

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

// NOTE: In this suite we supresses console error, log and warn calls.
const consoleError = vi.spyOn(console, 'error');
const consoleLog = vi.spyOn(console, 'log');
const consoleWarn = vi.spyOn(console, 'warn');
consoleError.mockImplementation(noOp);
consoleLog.mockImplementation(noOp);
consoleWarn.mockImplementation(noOp);

describe('The <NarrativeView /> component...', () => {
  beforeAll(() => {
    fetchMock.enableMocks();
  });

  afterAll(() => {
    fetchMock.disableMocks();
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
    const { container } = render(
      <Provider store={testStore}>
        <Router>
          <NarrativeView narrativeUPA={`${wsId}/2/3`} view={'preview'} />
        </Router>
      </Provider>
    );
    expect(container).toBeTruthy();
    await waitFor(() => {
      expect(container.querySelector('section.preview')).toBeInTheDocument();
    });
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
      <Provider store={createTestStore()}>
        <Router>
          <NarrativePreview
            cells={testNarrativeDoc.cells.slice(0, 16)}
            narrativeDoc={testNarrativeDoc}
            wsId={1}
          />
        </Router>
      </Provider>
    );
    expect(container).toBeTruthy();
    expect(container.querySelector('section.preview')).toBeInTheDocument();
  });

  test('renders with no cells.', () => {
    const { container } = render(
      <Provider store={createTestStore()}>
        <Router>
          <NarrativePreview
            cells={[]}
            narrativeDoc={testNarrativeDoc}
            wsId={1}
          />
        </Router>
      </Provider>
    );
    expect(container).toBeTruthy();
    expect(container.querySelector('section.preview')).toBeInTheDocument();
  });

  test('renders with one more cell.', () => {
    const { container } = render(
      <Provider store={createTestStore()}>
        <Router>
          <NarrativePreview
            cells={testNarrativeDoc.cells.slice(0, 17)}
            narrativeDoc={testNarrativeDoc}
            wsId={1}
          />
        </Router>
      </Provider>
    );
    expect(container).toBeTruthy();
    expect(container.querySelector('section.preview')).toBeInTheDocument();
  });

  test('renders with more cells.', () => {
    const { container } = render(
      <Provider store={createTestStore()}>
        <Router>
          <NarrativePreview
            narrativeDoc={testNarrativeDoc}
            cells={testNarrativeDoc.cells}
            wsId={1}
          />
        </Router>
      </Provider>
    );
    expect(container).toBeTruthy();
    expect(container.querySelector('section.preview')).toBeInTheDocument();
  });
});
