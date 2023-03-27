import {
  render,
  // screen
  // screen
} from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import { createTestStore } from '../../app/store';
import { NarrativePreviewTemplate } from '../../stories/components/NarrativePreview.stories';
import NarrativeView from './NarrativeView';
import { testNarrative } from './NarrativeView.fixture';

describe('The <NarrativeView /> component...', () => {
  test('renders.', () => {
    const { container } = render(
      <Provider store={createTestStore()}>
        <Router>
          <NarrativeView narrativeUPA={'1/2/3'} view={'preview'} />
        </Router>
      </Provider>
    );
    expect(container).toBeTruthy();
    expect(container.querySelector('section.view')).toBeInTheDocument();
  });
});

describe('The <NarrativePreview /> component...', () => {
  test('renders.', () => {
    const { container } = render(
      <Router>
        <NarrativePreviewTemplate
          wsId={1}
          cells={testNarrative.cells.slice(0, 16)}
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
          wsId={1}
          cells={testNarrative.cells.slice(0, 17)}
        />
      </Router>
    );
    expect(container).toBeTruthy();
    expect(container.querySelector('section.preview')).toBeInTheDocument();
  });
});
