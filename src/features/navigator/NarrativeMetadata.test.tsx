// Tests for <NarrativeMetadata />

import {
  render,
  // screen
} from '@testing-library/react';
import { MemoryRouter as Router } from 'react-router-dom';
import { usernameRequested, usernameOtherRequested } from '../common';
import { NarrativeMetadataTemplate } from '../../stories/components/NarrativeMetadata.stories';
import { testNarrativeDoc } from './fixtures';
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
      <Router>
        <NarrativeMetadataTemplate
          cells={testNarrativeDoc.cells}
          narrativeDoc={testNarrativeDoc}
        />
      </Router>
    );
    expect(container).toBeTruthy();
    expect(
      container.querySelector(`div.${classes.metadata}`)
    ).toBeInTheDocument();
  });

  test('renders shared users.', () => {
    /* The last shared user is weird, but included in some
       narrative documents in searchapi2, e.g. 67096/1/3
     */
    testNarrativeDoc.shared_users = [
      usernameRequested,
      usernameOtherRequested,
      '*',
    ];
    const { container } = render(
      <Router>
        <NarrativeMetadataTemplate
          cells={testNarrativeDoc.cells}
          narrativeDoc={testNarrativeDoc}
        />
      </Router>
    );
    expect(container).toBeTruthy();
    expect(
      container.querySelector(`div.${classes.metadata}`)
    ).toBeInTheDocument();
  });

  test('gives the option to show more shared users if they exist', () => {
    // The narrative metadata component displays only 10 shared users by default.
    testNarrativeDoc.shared_users = [testNarrativeDoc.creator].concat(
      ...Array(11)
        .fill(0)
        .map((_, ix) => `user${ix}`)
    );

    const { container } = render(
      <Router>
        <NarrativeMetadataTemplate
          cells={testNarrativeDoc.cells}
          narrativeDoc={testNarrativeDoc}
        />
      </Router>
    );
    expect(container).toBeTruthy();
    expect(
      container.querySelector(`div.${classes.metadata}`)
    ).toBeInTheDocument();
  });
});
