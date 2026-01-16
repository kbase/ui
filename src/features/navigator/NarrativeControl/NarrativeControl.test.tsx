// Tests for <NarrativeControl />

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import { createTestStore } from '../../../app/store';
import { noOp } from '../../common';
import { ModalDialog } from '../../layout/Modal';
import { testNarrativeDoc, initialTestState } from '../fixtures';
import NarrativeControl from './';
import { Copy } from './Copy';
import { LinkOrg } from './LinkOrg';
import { Rename } from './Rename';
import { Restore } from './Restore';
import { Share } from './Share';

describe('The <NarrativeControl /> component...', () => {
  test('renders.', () => {
    const { container } = render(
      <div style={{ textAlign: 'right' }}>
        <Provider store={createTestStore({ navigator: initialTestState })}>
          <NarrativeControl narrativeDoc={testNarrativeDoc} />
          <ModalDialog />
        </Provider>
      </div>
    );
    expect(container).toBeTruthy();
    expect(screen.getByText('Latest', { exact: false })).toBeInTheDocument();
  });
});

describe('The <Copy /> component...', () => {
  test('renders.', () => {
    const { container } = render(
      <Provider store={createTestStore()}>
        <Copy modalClose={noOp} narrativeDoc={testNarrativeDoc} version={1} />
      </Provider>
    );
    expect(container).toBeTruthy();
    expect(
      screen.getByText('Make a Copy', { exact: false })
    ).toBeInTheDocument();
  });
});

describe('The <LinkOrg /> component...', () => {
  test('renders.', () => {
    const { container } = render(
      <Provider store={createTestStore()}>
        <LinkOrg modalClose={noOp} narrativeDoc={testNarrativeDoc} />
      </Provider>
    );
    expect(container).toBeTruthy();
  });
});

describe('The <Rename /> component...', () => {
  test('renders.', () => {
    const { container } = render(
      <Provider store={createTestStore()}>
        <Rename modalClose={noOp} narrativeDoc={testNarrativeDoc} />
      </Provider>
    );
    expect(container).toBeTruthy();
    expect(
      screen.getByText('Rename Narrative', { exact: false })
    ).toBeInTheDocument();
  });
});

describe('The <Restore /> component...', () => {
  test('renders.', () => {
    const { container } = render(
      <Provider store={createTestStore()}>
        <Router>
          <Restore
            modalClose={noOp}
            narrativeDoc={testNarrativeDoc}
            version={1}
          />
        </Router>
      </Provider>
    );
    expect(container).toBeTruthy();
    expect(screen.getByText('Reverting', { exact: false })).toBeInTheDocument();
  });
});

describe('The <Share /> component...', () => {
  test('renders.', () => {
    const { container } = render(
      <Provider store={createTestStore()}>
        <Share modalClose={noOp} narrativeDoc={testNarrativeDoc} />
      </Provider>
    );
    expect(container).toBeTruthy();
    expect(
      screen.getByText('Manage Sharing', { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getByText('engage@kbase.us', { exact: false })
    ).toBeInTheDocument();
  });
});
