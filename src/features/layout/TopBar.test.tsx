import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { createTestStore } from '../../app/store';
import LoginPrompt from './TopBar';

describe('LoginPrompt component', () => {
  test('renders successfully with minimal props', () => {
    const { container } = render(
      <Provider store={createTestStore()}>
        <MemoryRouter>
          <LoginPrompt />
        </MemoryRouter>
      </Provider>
    );
    const loginButton = container.querySelector('[role="button"]');
    expect(loginButton).toHaveTextContent('Sign In');
    expect(loginButton).not.toHaveAttribute('aria-disabled');
    expect(loginButton).not.toBeDisabled();
  });

  test('is disabled if on the login path', () => {
    const { container } = render(
      <Provider store={createTestStore()}>
        <MemoryRouter initialEntries={['/dev/legacy/login']}>
          <LoginPrompt />
        </MemoryRouter>
      </Provider>
    );
    const loginButton = container.querySelector('[role="button"]');
    expect(loginButton).toHaveTextContent('Sign In');
    expect(loginButton).toHaveAttribute('aria-disabled');
    expect(loginButton).toBeDisabled();
  });

  test('is disabled if on the login continue path', () => {
    const { container } = render(
      <Provider store={createTestStore()}>
        <MemoryRouter initialEntries={['/dev/legacy/auth2/login/continue']}>
          <LoginPrompt />
        </MemoryRouter>
      </Provider>
    );
    const loginButton = container.querySelector('[role="button"]');
    expect(loginButton).toHaveTextContent('Sign In');
    expect(loginButton).toHaveAttribute('aria-disabled');
    expect(loginButton).toBeDisabled();
  });
});
