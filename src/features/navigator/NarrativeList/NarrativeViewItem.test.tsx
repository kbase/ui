import { screen, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter as Router, Route, Routes } from 'react-router-dom';
import { createTestStore } from '../../../app/store';
import { testItems } from '../fixtures';
import NarrativeViewItem from './NarrativeViewItem';
import { narrativeSelectedPath } from '../Navigator';

const testDoc = testItems[0];
const { access_group, creator, obj_id, version } = testDoc;
const testDocUPA = `${access_group}/${obj_id}/${version}`;

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
    screen.getByText(testDoc.narrative_title, { exact: false })
  ).toBeInTheDocument();
  expect(
    screen.getByText(`by ${creator}`, { exact: false })
  ).toBeInTheDocument();
});

test('NarrativeViewItem displays active class', () => {
  const { container } = render(
    <Provider store={createTestStore()}>
      <Router initialEntries={[`/narratives/${testDocUPA}`]}>
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
