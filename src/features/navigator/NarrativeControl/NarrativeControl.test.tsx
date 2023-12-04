// Tests for <NarrativeControl />

import { render, screen } from '@testing-library/react';
import { MemoryRouter as Router } from 'react-router-dom';
import { noOp } from '../../common';
import { testNarrativeDoc } from '../fixtures';
import {
  CopyTemplate,
  LinkOrgTemplate,
  NarrativeControlTemplate,
  RenameTemplate,
  RestoreTemplate,
  ShareTemplate,
} from './NarrativeControl.stories';

describe('The <NarrativeControl /> component...', () => {
  beforeAll(() => {
    window.gtag = jest.fn();
  });

  test('renders.', () => {
    const { container } = render(
      <NarrativeControlTemplate narrativeDoc={testNarrativeDoc} />
    );
    expect(container).toBeTruthy();
    expect(screen.getByText('Latest', { exact: false })).toBeInTheDocument();
  });
});

describe('The <Copy /> component...', () => {
  test('renders.', () => {
    const { container } = render(
      <CopyTemplate
        modalClose={noOp}
        narrativeDoc={testNarrativeDoc}
        version={1}
      />
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
      <LinkOrgTemplate modalClose={noOp} narrativeDoc={testNarrativeDoc} />
    );
    expect(container).toBeTruthy();
  });
});

describe('The <Rename /> component...', () => {
  test('renders.', () => {
    const { container } = render(
      <RenameTemplate modalClose={noOp} narrativeDoc={testNarrativeDoc} />
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
      <Router>
        <RestoreTemplate
          modalClose={noOp}
          narrativeDoc={testNarrativeDoc}
          version={1}
        />
      </Router>
    );
    expect(container).toBeTruthy();
    expect(screen.getByText('Reverting', { exact: false })).toBeInTheDocument();
  });
});

describe('The <Share /> component...', () => {
  test('renders.', () => {
    const { container } = render(
      <ShareTemplate modalClose={noOp} narrativeDoc={testNarrativeDoc} />
    );
    expect(container).toBeTruthy();
    expect(
      screen.getByText('Manage Sharing', { exact: false })
    ).toBeInTheDocument();
  });
});
