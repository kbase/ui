import { screen, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import { createTestStore } from '../../../app/store';
import { NarrativeListDoc } from '../../../common/types/NarrativeDoc';
import NarrativeViewItem from './NarrativeViewItem';
import { narrativeSelectedPath } from '../Navigator';

const testDoc: NarrativeListDoc = {
  timestamp: 0,
  access_group: 4000,
  obj_id: 4000,
  version: 4000,
  narrative_title: 'What a cool narrative',
  creator: 'JaRule',
};

test('NarrativeViewItem renders', () => {
  const { container } = render(
    <Provider store={createTestStore()}>
      <Router>
        <NarrativeViewItem idx={0} item={testDoc} showVersionDropdown={true} />
      </Router>
    </Provider>
  );
  expect(container).toBeTruthy();
  expect(container.querySelectorAll('.narrative_item_outer')).toHaveLength(1);
  expect(
    screen.getByText('What a cool narrative', { exact: false })
  ).toBeInTheDocument();
  expect(screen.getByText('JaRule', { exact: false })).toBeInTheDocument();
  expect(screen.getByText('cool', { exact: false })).toBeInTheDocument();
});

test('NarrativeViewItem displays active class', () => {
  const { container } = render(
    <Provider store={createTestStore()}>
      <Router initialEntries={[`/narratives/4000/4000/4000`]}>
        <Routes>
          <Route
            path={narrativeSelectedPath}
            element={
              <NarrativeViewItem
                idx={0}
                item={testDoc}
                showVersionDropdown={true}
              />
            }
          />
        </Routes>
      </Router>
    </Provider>
  );
  expect(container.querySelector('.narrative_item_outer')).toHaveClass(
    'active'
  );
});
