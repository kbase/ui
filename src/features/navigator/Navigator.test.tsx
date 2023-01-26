import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import {
  Route,
  Routes as RRRoutes,
  MemoryRouter as Router,
} from 'react-router-dom';
import { createTestStore } from '../../app/store';
import Routes from '../../app/Routes';
import { ignoredParameterWarning } from '../../common/hooks';
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
  expect(container.querySelector('section.navigator')).toBeInTheDocument();
});

test(`Navigator uses the 'public' Category when specified`, () => {
  const { container } = render(
    <Provider store={createTestStore()}>
      <Router initialEntries={['/narratives/public/']}>
        <RRRoutes>
          <Route path={'/narratives/:category'} element={<Navigator />} />
        </RRRoutes>
      </Router>
    </Provider>
  );
  expect(container).toBeTruthy();
  // screen.debug();
});

test(`Navigator uses the 'own' Category when category is unknown`, () => {
  const { container } = render(
    <Provider store={createTestStore()}>
      <Router initialEntries={['/narratives/hooey/']}>
        <RRRoutes>
          <Route path={'/narratives/:category'} element={<Navigator />} />
        </RRRoutes>
      </Router>
    </Provider>
  );
  expect(container).toBeTruthy();
  // screen.debug();
});

test('Navigator ignores hooey search parameters', () => {
  const consoleLog = jest.spyOn(console, 'log');
  consoleLog.mockImplementation(() => undefined);
  const { container } = render(
    <Provider store={createTestStore()}>
      <Router initialEntries={['?hooey=fooey']}>
        <Routes />
      </Router>
    </Provider>
  );
  expect(container).toBeTruthy();
  expect(consoleLog).toHaveBeenCalledWith(ignoredParameterWarning(['hooey']));
});

test('Navigator assigns recognized search parameters', () => {
  const { container } = render(
    <Provider store={createTestStore()}>
      <Router initialEntries={['?search=taco']}>
        <Routes />
      </Router>
    </Provider>
  );
  expect(container).toBeTruthy();
  // screen.debug();
});
