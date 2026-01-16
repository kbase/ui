import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createTestStore } from '../../app/store';
import * as layoutSlice from '../layout/layoutSlice';
import PageNotFound, { TITLE } from './PageNotFound';
import { vi } from 'vitest';

const PAGE_NOT_FOUND_TITLE = TITLE;

describe('PageNotFound Component', () => {
  test('renders the default title and a message', () => {
    const titleSpy = vi.spyOn(layoutSlice, 'usePageTitle');
    const message = 'My Page Is Not Found';
    render(
      <Provider store={createTestStore()}>
        <PageNotFound message={message} />
      </Provider>
    );
    expect(screen.getByText(PAGE_NOT_FOUND_TITLE)).toBeVisible();
    expect(screen.getByText(message)).toBeVisible();
    expect(titleSpy).toHaveBeenCalledWith(PAGE_NOT_FOUND_TITLE);
  });

  test('renders the default title, even without a message.', () => {
    const titleSpy = vi.spyOn(layoutSlice, 'usePageTitle');
    render(
      <Provider store={createTestStore()}>
        <PageNotFound />
      </Provider>
    );
    expect(screen.getByText(PAGE_NOT_FOUND_TITLE)).toBeVisible();
    expect(titleSpy).toHaveBeenCalledWith(PAGE_NOT_FOUND_TITLE);
  });
});
