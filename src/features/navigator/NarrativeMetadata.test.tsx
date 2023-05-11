// Tests for <NarrativeMetadata />

import {
  render,
  // screen
  waitFor,
} from '@testing-library/react';
import fetchMock, {
  disableFetchMocks,
  enableFetchMocks,
} from 'jest-fetch-mock';
import { NarrativeMetadataTemplate } from '../../stories/components/NarrativeMetadata.stories';
import { usernameRequested, usernameOtherRequested } from '../common';
import { testNarrativeDoc, testResponseOKFactory } from './fixtures';
import classes from './Navigator.module.scss';

const consoleError = jest.spyOn(console, 'error');
// This mockImplementation supresses console.error calls.
// eslint-disable-next-line @typescript-eslint/no-empty-function
consoleError.mockImplementation(() => {});

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
      <NarrativeMetadataTemplate
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
    enableFetchMocks();
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
        <NarrativeMetadataTemplate
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
    disableFetchMocks();
  });

  test('gives the option to show more shared users if they exist', () => {
    // The narrative metadata component displays only 10 shared users by default.
    testNarrativeDoc.shared_users = [testNarrativeDoc.creator].concat(
      ...Array(11)
        .fill(0)
        .map((_, ix) => `user${ix}`)
    );

    const { container } = render(
      <NarrativeMetadataTemplate
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
