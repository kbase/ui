import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import { createTestStore } from '../../../app/store';
import NarrativeList from './NarrativeList';
import { testItems } from './NarrativeList.fixture';

test('NarrativeList renders', async () => {
  const { container } = render(
    <Provider store={createTestStore()}>
      <Router>
        <NarrativeList
          hasMoreItems={false}
          items={testItems}
          itemsRemaining={0}
          loading={false}
          narrative={null}
          nextLimit={''}
          showVersionDropdown={true}
        />
      </Router>
    </Provider>
  );
  expect(container).toBeTruthy();
  expect(container.querySelectorAll('.narrative_item_outer')).toHaveLength(21);
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
          narrative={null}
          nextLimit={''}
          showVersionDropdown={true}
        />
      </Router>
    </Provider>
  );
  expect(container.querySelectorAll('.narrative_item_outer')).toHaveLength(0);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});

test('NarrativeList can load more items', async () => {
  const onLoadMoreItemsSpy = jest.fn();
  const { container } = render(
    <Provider store={createTestStore()}>
      <Router>
        <NarrativeList
          hasMoreItems={true}
          items={testItems}
          itemsRemaining={42}
          loading={false}
          narrative={null}
          nextLimit={''}
          onLoadMoreItems={onLoadMoreItemsSpy}
          showVersionDropdown={true}
        />
      </Router>
    </Provider>
  );
  expect(container.querySelector('.list_footer')).toBeInTheDocument();
  const button = screen.getByText('Load more (42 remaining)');
  expect(button).toBeInTheDocument();
  button.click();
  expect(onLoadMoreItemsSpy).toHaveBeenCalledTimes(1);
});
