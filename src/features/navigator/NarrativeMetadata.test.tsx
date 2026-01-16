// Tests for <NarrativeMetadata />

import {
  render,
  // screen
  waitFor,
} from '@testing-library/react';
import createFetchMock from 'vitest-fetch-mock';
import { vi } from 'vitest';
import { Provider } from 'react-redux';
import { createTestStore, RootState } from '../../app/store';
import NarrativeMetadata from './NarrativeMetadata';
import { usernameRequested, usernameOtherRequested } from '../common';
import { testNarrativeDoc, testResponseOKFactory } from './fixtures';
import classes from './Navigator.module.scss';

const fetchMock = createFetchMock(vi);

const consoleError = vi.spyOn(console, 'error');
// This mockImplementation supresses console.error calls.
// eslint-disable-next-line @typescript-eslint/no-empty-function
consoleError.mockImplementation(() => {});

interface MetadataWrapperProps {
  cells: typeof testNarrativeDoc.cells;
  narrativeDoc: typeof testNarrativeDoc;
  initialState?: Partial<RootState>;
}

const NarrativeMetadataWrapper = ({
  cells,
  narrativeDoc,
  initialState,
}: MetadataWrapperProps) => (
  <Provider store={createTestStore(initialState)}>
    <NarrativeMetadata cells={cells} narrativeDoc={narrativeDoc} />
  </Provider>
);

describe('The <NarrativeMetadata /> component...', () => {
  afterAll(() => {
    consoleError.mockRestore();
  });

  afterEach(() => {
    consoleError.mockClear();
  });

  beforeEach(() => {
    consoleError.mockClear();
  });

  test('renders.', () => {
    const { container } = render(
      <NarrativeMetadataWrapper
        cells={testNarrativeDoc.cells}
        narrativeDoc={testNarrativeDoc}
      />
    );
    expect(container).toBeTruthy();
    expect(
      container.querySelector(`div.${classes.metadata}`)
    ).toBeInTheDocument();
  });

  test('renders shared users.', async () => {
    fetchMock.enableMocks();
    const resp = testResponseOKFactory(testNarrativeDoc);
    fetchMock.mockResponses(resp, resp, resp);
    /* The last shared user is weird, but included in some
       narrative documents in searchapi2, e.g. 67096/1/3
     */
    testNarrativeDoc.shared_users = [
      usernameRequested,
      usernameOtherRequested,
      '*',
    ];
    const initialState = {
      auth: { initialized: true, token: 'KBASE_TEST_TOKEN' },
    };
    const { container } = await waitFor(() =>
      render(
        <NarrativeMetadataWrapper
          cells={testNarrativeDoc.cells}
          narrativeDoc={testNarrativeDoc}
          initialState={initialState}
        />
      )
    );
    expect(container).toBeTruthy();
    expect(
      container.querySelector(`div.${classes.metadata}`)
    ).toBeInTheDocument();
    fetchMock.disableMocks();
  });

  test('gives the option to show more shared users if they exist', () => {
    // The narrative metadata component displays only 10 shared users by default.
    testNarrativeDoc.shared_users = [testNarrativeDoc.creator].concat(
      ...Array(11)
        .fill(0)
        .map((_, ix) => `user${ix}`)
    );

    const { container } = render(
      <NarrativeMetadataWrapper
        cells={testNarrativeDoc.cells}
        narrativeDoc={testNarrativeDoc}
      />
    );
    expect(container).toBeTruthy();
    expect(
      container.querySelector(`div.${classes.metadata}`)
    ).toBeInTheDocument();
  });
});
