import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createTestStore } from '../../app/store';
import FallbackNotFound from './FallbackNotFound';

describe('FallbackNotFound Component', () => {
  test('Displays the expected content', async () => {
    const { container } = render(
      <Provider store={createTestStore()}>
        <MemoryRouter initialEntries={[`/fallback/foo`]}>
          <Routes>
            <Route path={`/fallback/*`} element={<FallbackNotFound />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(
      () => {
        expect(container).toHaveTextContent('Page Not Found');
        expect(container).toHaveTextContent('kbase-ui path "foo" not found');
      },
      { timeout: 1000 }
    );
  });
});
