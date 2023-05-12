import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import { createTestStore } from '../../app/store';
import SortSelect from './SortSelect';

test('SortSelect renders', () => {
  const { container } = render(
    <Provider store={createTestStore()}>
      <Router>
        <SortSelect sort={'lex'} />
      </Router>
    </Provider>
  );
  expect(container).toBeTruthy();
  expect(container.querySelector('.react-select.sort')).toBeInTheDocument();
});

test('SortSelectOnChange is called ', async () => {
  const { container } = render(
    <Provider store={createTestStore()}>
      <Router>
        <SortSelect sort={'lex'} />
      </Router>
    </Provider>
  );
  expect(container).toBeTruthy();
  const selectControl = container.querySelector('.react-select__control');
  expect(selectControl).toBeInTheDocument();
  await act(async () => {
    selectControl && (await userEvent.click(selectControl));
  });
  const opt = await screen.findByText('Reverse', { exact: false });
  await act(async () => {
    opt && (await userEvent.click(opt));
  });
});
