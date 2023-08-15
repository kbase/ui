// Tests for <NarrativeControl />

import { render, screen } from '@testing-library/react';
import { emptyFunction } from '../common';
import { testNarrativeDoc } from '../fixtures';
import {
  CopyTemplate,
  DeleteTemplate,
  LinkOrgTemplate,
  NarrativeControlTemplate,
  RenameTemplate,
  RestoreTemplate,
  ShareTemplate,
} from './NarrativeControl.stories';

describe('The <NarrativeControl /> component...', () => {
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
        modalClose={emptyFunction}
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

describe('The <Delete /> component...', () => {
  test('renders.', () => {
    const { container } = render(
      <DeleteTemplate
        modalClose={emptyFunction}
        narrativeDoc={testNarrativeDoc}
      />
    );
    expect(container).toBeTruthy();
    expect(
      screen.getByText('Delete Narrative', { exact: false })
    ).toBeInTheDocument();
  });
});

describe('The <LinkOrg /> component...', () => {
  test('renders.', () => {
    const { container } = render(
      <LinkOrgTemplate
        modalClose={emptyFunction}
        narrativeDoc={testNarrativeDoc}
      />
    );
    expect(container).toBeTruthy();
  });
});

describe('The <Rename /> component...', () => {
  test('renders.', () => {
    const { container } = render(
      <RenameTemplate
        modalClose={emptyFunction}
        narrativeDoc={testNarrativeDoc}
      />
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
      <RestoreTemplate
        modalClose={emptyFunction}
        narrativeDoc={testNarrativeDoc}
        version={1}
      />
    );
    expect(container).toBeTruthy();
    expect(screen.getByText('Reverting', { exact: false })).toBeInTheDocument();
  });
});

describe('The <Share /> component...', () => {
  test('renders.', () => {
    const { container } = render(
      <ShareTemplate
        modalClose={emptyFunction}
        narrativeDoc={testNarrativeDoc}
      />
    );
    expect(container).toBeTruthy();
    expect(
      screen.getByText('Manage Sharing', { exact: false })
    ).toBeInTheDocument();
  });
});
