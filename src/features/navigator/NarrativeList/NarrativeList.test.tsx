import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import { createTestStore } from '../../../app/store';
import NarrativeList from './NarrativeList';
import { testItems } from '../fixtures';

test('NarrativeList renders', async () => {
  const { container } = render(
    <Provider store={createTestStore()}>
      <Router>
        <NarrativeList
          hasMoreItems={false}
          items={testItems}
          itemsRemaining={0}
          loading={false}
          narrativeUPA={null}
          nextLimit={''}
          showVersionDropdown={true}
        />
      </Router>
    </Provider>
  );
  expect(container).toBeTruthy();
  expect(container.querySelectorAll('.narrative_item_outer')).toHaveLength(22);
  expect(screen.getByText('No more results.')).toBeInTheDocument();
});

test('NarrativeList displays loading circle', async () => {
  const { container } = render(
    <Provider store={createTestStore()}>
      <Router>
        <NarrativeList
          hasMoreItems={false}
          items={[]}
          itemsRemaining={0}
          loading={true}
          narrativeUPA={null}
          nextLimit={''}
          showVersionDropdown={true}
        />
      </Router>
    </Provider>
  );
  expect(container.querySelectorAll('.narrative_item_outer')).toHaveLength(0);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});
