import '../src/index.scss';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { createTestStore } from '../src/app/store';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  options: {
    storySort: (a, b) => {
      const keyA = a[1].title;
      const keyB = b[1].title;
      return keyA === keyB
        ? 0
        : keyA.localeCompare(keyB, undefined, { numeric: true });
    },
  },
};

export const decorators = [
  (Story) => (
    <Provider store={createTestStore()}>
      <Router>
        <Story />
      </Router>
    </Provider>
  ),
];
