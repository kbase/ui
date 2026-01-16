import '../src/index.scss';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { createTestStore } from '../src/app/store';
import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    options: {
      storySort: (a, b) => {
        const keyA = a.title;
        const keyB = b.title;
        return keyA === keyB
          ? 0
          : keyA.localeCompare(keyB, undefined, { numeric: true });
      },
    },
  },
  decorators: [
    (Story) => (
      <Provider store={createTestStore()}>
        <Router>
          <Story />
        </Router>
      </Provider>
    ),
  ],
};

export default preview;
