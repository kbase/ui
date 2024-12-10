import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { KBasePolicies } from './SignupPolicies';
import { toast } from 'react-hot-toast';
import * as SignUp from './SignUp';

jest.mock('react-hot-toast');
jest.mock('./AccountInformation', () => ({
  useCheckLoginDataOk: jest.fn(),
}));
jest.mock('./SignUp', () => ({
  useDoSignup: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../login/EnforcePolicies', () => ({
  PolicyViewer: ({
    policyId,
    accepted,
    setAccept,
  }: {
    policyId: string;
    accepted: boolean;
    setAccept: (checked: boolean) => void;
  }) => (
    <div data-testid={`policy-${policyId}`}>
      <input
        type="checkbox"
        checked={accepted}
        onChange={(e) => setAccept(e.target.checked)}
        data-testid={`checkbox-${policyId}`}
      />
    </div>
  ),
}));

jest.mock('../login/Policies', () => ({
  kbasePolicies: {
    termsOfService: {
      id: 'termsOfService',
      version: '1',
      title: 'Terms of Service',
      markdown: 'Terms of Service content',
    },
    privacyPolicy: {
      id: 'privacyPolicy',
      version: '1',
      title: 'Privacy Policy',
      markdown: 'Privacy Policy content',
    },
  },
}));

const mockScrollTo = jest.fn();
Element.prototype.scrollTo = mockScrollTo;

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      signup: (state = { account: {} }, action) => state,
    },
    preloadedState: {
      signup: {
        account: {
          username: 'testuser',
          email: 'test@test.com',
          ...initialState,
        },
      },
    },
  });
};

describe('Signup Policies', () => {
  const mockDoSignup = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (SignUp.useDoSignup as jest.Mock).mockReturnValue([mockDoSignup, false]);
  });

  const renderComponent = (store = createMockStore()) => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <KBasePolicies />
        </MemoryRouter>
      </Provider>
    );
  };

  it('should render all policies', () => {
    renderComponent();
    expect(screen.getByTestId('policy-termsOfService')).toBeInTheDocument();
    expect(screen.getByTestId('policy-privacyPolicy')).toBeInTheDocument();
  });

  it('should not call doSignup when policies are not accepted', () => {
    renderComponent();
    const submitButton = screen.getByText('Create KBase account');
    Object.defineProperty(submitButton, 'disabled', { value: false });
    fireEvent.click(submitButton);
    expect(mockDoSignup).not.toHaveBeenCalled();
  });

  it('should handle policy acceptance', () => {
    renderComponent();
    const tosCheckbox = screen.getByTestId('checkbox-termsOfService');
    const privacyCheckbox = screen.getByTestId('checkbox-privacyPolicy');
    const submitButton = screen.getByText('Create KBase account');
    expect(submitButton).toBeDisabled();
    fireEvent.click(tosCheckbox);
    fireEvent.click(privacyCheckbox);
    expect(submitButton).not.toBeDisabled();
  });

  it('should call doSignup when all policies are accepted and form is submitted', () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('checkbox-termsOfService'));
    fireEvent.click(screen.getByTestId('checkbox-privacyPolicy'));
    fireEvent.click(screen.getByText('Create KBase account'));
    expect(mockDoSignup).toHaveBeenCalledWith([
      'termsOfService.1',
      'privacyPolicy.1',
    ]);
  });

  it('should show warning toast if account information is missing', () => {
    const store = createMockStore({ username: undefined });
    renderComponent(store);
    expect(toast).toHaveBeenCalledWith(
      'You must fill out your account information to sign up!'
    );
  });

  it('should navigate when cancel button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Cancel sign up'));
    expect(mockNavigate).toHaveBeenCalledWith('/signup/1');
  });

  it('should navigate when back button is clicked', () => {
    renderComponent();
    fireEvent.click(screen.getByText('Back to account information'));
    expect(mockNavigate).toHaveBeenCalledWith('/signup/2');
  });
});
