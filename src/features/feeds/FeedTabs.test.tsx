import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import { createTestStore } from '../../app/store';
import FeedTabs, { FeedTabsProps } from './FeedTabs';

const testProps: FeedTabsProps = {
  userId: 'some_user',
  isAdmin: false,
  feeds: {
    feed1: {
      name: 'A feed',
      feed: [],
      unseen: 0,
    },
  },
};

test('FeedTabs renders', async () => {
  const { container } = render(
    <Provider store={createTestStore()}>
      <Router>
        <FeedTabs {...testProps}/>
      </Router>
    </Provider>
  );
  expect(container).toBeTruthy();
  expect(container.textContent).toMatch(testProps.userId);
});
