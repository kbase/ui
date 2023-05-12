import React from 'react';
import { act, render, screen } from '@testing-library/react';
import App from './App';

import { Provider } from 'react-redux';
import { createTestStore } from './store';

test('renders Auth page link', () => {
  render(
    <Provider store={createTestStore()}>
      <App />
    </Provider>
  );
  const linkElement = screen.getByText(/Auth/i);
  expect(linkElement).toBeInTheDocument();
});

test('Auth page link works', async () => {
  render(
    <Provider store={createTestStore()}>
      <App />
    </Provider>
  );
  const linkElement = screen.getByText(/Auth/i);
  act(() => {
    linkElement.click();
  });
  const LoginStatusText = await screen.findByText(/You are not logged in/);
  expect(LoginStatusText).toBeInTheDocument();
});
