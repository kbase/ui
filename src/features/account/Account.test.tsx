import { render, screen, fireEvent } from '@testing-library/react';
import { useEffect } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
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
const mockScrollTo = jest.fn();

describe('Account Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders all tabs', () => {
    render(
      <MemoryRouter initialEntries={['/account/info']}>
        <Routes>
          <Route path="/account/*" element={<Account />}>
            <Route path="*" element={<MockOutlet />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Linked Providers')).toBeInTheDocument();
    expect(screen.getByText('Log In Sessions')).toBeInTheDocument();
    expect(screen.getByText('Use Agreements')).toBeInTheDocument();
  });

  it('navigates to correct route when tab is clicked', () => {
    render(
      <MemoryRouter initialEntries={['/account/info']}>
        <Routes>
          <Route path="/account/*" element={<Account />}>
            <Route path="*" element={<MockOutlet />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Linked Providers'));
    expect(mockOutletLocation).toContain('/account/providers');

    fireEvent.click(screen.getByText('Log In Sessions'));
    expect(mockOutletLocation).toContain('/account/sessions');
  });

  it('scrolls to top when tab changes', () => {
    render(
      <MemoryRouter initialEntries={['/account/info']}>
        <Routes>
          <Route path="/account/*" element={<Account />}>
            <Route path="*" element={<MockOutlet />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const my_element = document.querySelector('main');
    if (!my_element) return;
    jest.spyOn(my_element, 'scrollTo').mockImplementation(mockScrollTo);

    fireEvent.click(screen.getByText('Linked Providers'));
    expect(mockScrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('sets correct active tab based on current route', () => {
    render(
      <MemoryRouter initialEntries={['/account/providers']}>
        <Routes>
          <Route path="/account/*" element={<Account />}>
            <Route path="*" element={<MockOutlet />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const providersTab = screen.getByRole('tab', { name: 'Linked Providers' });
    expect(providersTab).toHaveAttribute('aria-selected', 'true');
  });

  it('navigates to correct routes when tabs are clicked', () => {
    render(
      <MemoryRouter initialEntries={['/account']}>
        <Routes>
          <Route path="/account/*" element={<Account />}>
            <Route path="*" element={<MockOutlet />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Test Account tab navigation
    fireEvent.click(screen.getByRole('tab', { name: 'Account' }));
    expect(mockOutletLocation).toBe('/account/info');

    // Test Linked Providers tab navigation
    fireEvent.click(screen.getByRole('tab', { name: 'Linked Providers' }));
    expect(mockOutletLocation).toBe('/account/providers');

    // Test Log In Sessions tab navigation
    fireEvent.click(screen.getByRole('tab', { name: 'Log In Sessions' }));
    expect(mockOutletLocation).toBe('/account/sessions');

    // Test Use Agreements tab navigation
    fireEvent.click(screen.getByRole('tab', { name: 'Use Agreements' }));
    expect(mockOutletLocation).toBe('/account/use-agreements');
  });

  it('handles tab clicks with correct aria controls', () => {
    render(
      <MemoryRouter initialEntries={['/account']}>
        <Routes>
          <Route path="/account/*" element={<Account />}>
            <Route path="*" element={<MockOutlet />} />
          </Route>
        </Routes>
      </MemoryRouter>
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
