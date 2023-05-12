import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import { createTestStore } from '../../app/store';
import SearchInput from './SearchInput';

test('SearchInput renders', () => {
  const { container } = render(
    <Provider store={createTestStore()}>
      <Router>
        <SearchInput label={<></>} search={'search'} />
      </Router>
    </Provider>
  );
  expect(container).toBeTruthy();
  expect(container.querySelector('input.input')).toBeInTheDocument();
});

test('SearchChangeHandler is called', async () => {
  const { container } = render(
    <Provider store={createTestStore()}>
      <Router>
        <SearchInput label={<>Input</>} search={'cake'} />
      </Router>
    </Provider>
  );
  expect(container).toBeTruthy();
  const inputElement = screen.getByLabelText('Input', {
    exact: false,
  });
  await act(async () => {
    await userEvent.type(inputElement, 'taco');
  });
});

test('SearchChangeHandler is called and unsets query parameter', async () => {
  const { container } = render(
    <Provider store={createTestStore()}>
      <Router initialEntries={['?search=c']}>
        <SearchInput label={<>Input</>} search={'c'} />
      </Router>
    </Provider>
  );
  expect(container).toBeTruthy();
  const inputElement = screen.getByLabelText('Input', {
    exact: false,
  });
  await act(async () => {
    await userEvent.type(inputElement, '[Backspace]taco');
  });
});
