import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import { createTestStore } from '../../app/store';
import Navigator from './Navigator';

test('Navigator renders', () => {
  const { container } = render(
    <Provider store={createTestStore()}>
      <Router>
        <Navigator />
      </Router>
    </Provider>
  );
  expect(container).toBeTruthy();
  screen.debug();
  expect(container.querySelector('section.navigator')).toBeInTheDocument();
});
