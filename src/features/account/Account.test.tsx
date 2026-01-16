import { render, screen, fireEvent } from '@testing-library/react';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { createTestStore } from '../../app/store';
import { Account } from './Account';

// Mock component for the Outlet
let mockOutletLocation = '';
const MockOutlet = () => {
  const location = useLocation();
  useEffect(() => {
    mockOutletLocation = location.pathname;
  }, [location.pathname]);
  return <div data-testid="mock-outlet">Outlet Content</div>;
};

// Mock scrollTo function since we're testing useEffect scroll behavior
const mockScrollTo = vi.fn();

describe('Account Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders all tabs', () => {
    render(
      <Provider store={createTestStore()}>
        <MemoryRouter initialEntries={['/account/info']}>
          <Routes>
            <Route path="/account/*" element={<Account />}>
              <Route path="*" element={<MockOutlet />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Linked Providers')).toBeInTheDocument();
    expect(screen.getByText('Log In Sessions')).toBeInTheDocument();
    expect(screen.getByText('Use Agreements')).toBeInTheDocument();
  });

  it('navigates to correct route when tab is clicked', () => {
    render(
      <Provider store={createTestStore()}>
        <MemoryRouter initialEntries={['/account/info']}>
          <Routes>
            <Route path="/account/*" element={<Account />}>
              <Route path="*" element={<MockOutlet />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    fireEvent.click(screen.getByText('Linked Providers'));
    expect(mockOutletLocation).toContain('/account/providers');

    fireEvent.click(screen.getByText('Log In Sessions'));
    expect(mockOutletLocation).toContain('/account/sessions');
  });

  it('scrolls to top when tab changes', () => {
    render(
      <Provider store={createTestStore()}>
        <MemoryRouter initialEntries={['/account/info']}>
          <Routes>
            <Route path="/account/*" element={<Account />}>
              <Route path="*" element={<MockOutlet />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    const my_element = document.querySelector('main');
    if (!my_element) return;
    vi.spyOn(my_element, 'scrollTo').mockImplementation(mockScrollTo);

    fireEvent.click(screen.getByText('Linked Providers'));
    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('sets correct active tab based on current route', () => {
    render(
      <Provider store={createTestStore()}>
        <MemoryRouter initialEntries={['/account/providers']}>
          <Routes>
            <Route path="/account/*" element={<Account />}>
              <Route path="*" element={<MockOutlet />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    const providersTab = screen.getByRole('tab', { name: 'Linked Providers' });
    expect(providersTab).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates to correct routes when tabs are clicked', () => {
    render(
      <Provider store={createTestStore()}>
        <MemoryRouter initialEntries={['/account']}>
          <Routes>
            <Route path="/account/*" element={<Account />}>
              <Route path="*" element={<MockOutlet />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    // Test Linked Providers tab navigation
    fireEvent.click(screen.getByRole('tab', { name: 'Linked Providers' }));
    expect(mockOutletLocation).toBe('/account/providers');

    // Test Account tab navigation
    fireEvent.click(screen.getByRole('tab', { name: 'Account' }));
    expect(mockOutletLocation).toBe('/account/info');

    // Test Log In Sessions tab navigation
    fireEvent.click(screen.getByRole('tab', { name: 'Log In Sessions' }));
    expect(mockOutletLocation).toBe('/account/sessions');

    // Test Use Agreements tab navigation
    fireEvent.click(screen.getByRole('tab', { name: 'Use Agreements' }));
    expect(mockOutletLocation).toBe('/account/use-agreements');
  });

  it('handles tab clicks with correct aria controls', () => {
    render(
      <Provider store={createTestStore()}>
        <MemoryRouter initialEntries={['/account']}>
          <Routes>
            <Route path="/account/*" element={<Account />}>
              <Route path="*" element={<MockOutlet />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    const accountTab = screen.getByRole('tab', { name: 'Account' });
    const providersTab = screen.getByRole('tab', { name: 'Linked Providers' });
    const sessionsTab = screen.getByRole('tab', { name: 'Log In Sessions' });
    const agreementsTab = screen.getByRole('tab', { name: 'Use Agreements' });

    expect(accountTab).toHaveAttribute('aria-controls', 'account-tabpanel');
    expect(providersTab).toHaveAttribute('aria-controls', 'providers-tabpanel');
    expect(sessionsTab).toHaveAttribute('aria-controls', 'sessions-tabpanel');
    expect(agreementsTab).toHaveAttribute(
      'aria-controls',
      'use-agreements-tabpanel'
    );
  });
});
