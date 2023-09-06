import React from 'react';
import { act, render, screen } from '@testing-library/react';
import App from './App';

import { Provider } from 'react-redux';
import { createTestStore } from './store';

const consoleInfo = jest.spyOn(console, 'info');
// This mockImplementation supresses console.info calls.
// eslint-disable-next-line @typescript-eslint/no-empty-function
consoleInfo.mockImplementation(() => {});

describe('The main UI for Europa...', () => {
  afterAll(() => {
    consoleInfo.mockRestore();
  });

  afterEach(() => {
    consoleInfo.mockClear();
  });

  beforeEach(() => {
    consoleInfo.mockClear();
  });

  test('renders a Navigator page link', () => {
    render(
      <Provider store={createTestStore()}>
        <App />
      </Provider>
    );
    const linkElement = screen.getByText(/Navigator/, { exact: false });
    expect(linkElement).toBeInTheDocument();
  });

  test('contains a working link to the Navigator', async () => {
    const { container } = render(
      <Provider store={createTestStore()}>
        <App />
      </Provider>
    );
    const linkElement = screen.getByText(/Navigator/, { exact: false });
    await act(() => {
      linkElement.click();
    });
    const pageContent = container.querySelector('.page_content');
    expect(pageContent).toBeInTheDocument();
  });
});
