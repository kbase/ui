import { ThemeProvider } from '@emotion/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { createTestStore } from '../../app/store';
import { theme } from '../../theme';
import { noOp } from '../common';
import { EnforcePolicies } from './EnforcePolicies';

jest.mock('./Policies', () => ({
  ...jest.requireActual('./Policies'),
  kbasePolicies: {
    'kbase-user': {
      raw: '---\ntitle: KBase Terms and Conditions\nid: kbase-user\nversion: 1\nequivalentVersions: []\n---\nsome content',
      markdown: 'some content',
      title: 'KBase Terms and Conditions',
      id: 'kbase-user',
      version: '2',
      equivalentVersions: [],
    },
    'test-policy': {
      raw: '---\ntitle: Test Policy\nid: test-policy\nversion: 1\nequivalentVersions: []\n---\ntest content',
      markdown: 'test content',
      title: 'Test Policy',
      id: 'test-policy',
      version: '1',
      equivalentVersions: [],
    },
  },
}));

const renderWithProviders = (
  ui: React.ReactElement,
  { store = createTestStore() } = {}
) => {
  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <main style={{ height: '100vh' }}>{ui}</main>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
};

describe('EnforcePolicies', () => {
  it('renders default message', () => {
    renderWithProviders(
      <EnforcePolicies policyIds={['test-policy']} onAccept={noOp} />
    );
    expect(
      screen.getByText(
        'To continue to your account, you must agree to the following KBase use policies.'
      )
    ).toBeInTheDocument();
  });

  it('renders special v2 policy message', () => {
    renderWithProviders(
      <EnforcePolicies policyIds={['kbase-user']} onAccept={noOp} />
    );
    expect(
      screen.getByText(
        "KBase's recent renewal has prompted an update and version 2 release to our Terms and Conditions. Please review and agree to these policies changes to continue using this free resource."
      )
    ).toBeInTheDocument();
  });

  it('disables accept button until all policies are accepted', async () => {
    const mockAccept = jest.fn();
    renderWithProviders(
      <EnforcePolicies policyIds={['kbase-user']} onAccept={mockAccept} />
    );

    const acceptButton = screen.getByRole('button', {
      name: /agree and continue/i,
    });
    expect(acceptButton).toBeDisabled();

    const checkbox = screen.getByTestId('policy-checkbox');
    await userEvent.click(checkbox);

    expect(acceptButton).toBeEnabled();
  });

  it('calls onAccept when accept button clicked', async () => {
    const mockAccept = jest.fn();
    renderWithProviders(
      <EnforcePolicies policyIds={['kbase-user']} onAccept={mockAccept} />
    );

    const checkbox = screen.getByTestId('policy-checkbox');
    await userEvent.click(checkbox);

    const acceptButton = screen.getByRole('button', {
      name: /agree and continue/i,
    });
    await userEvent.click(acceptButton);

    expect(mockAccept).toHaveBeenCalledWith(['kbase-user.2']);
  });
  it('throws error when policy does not exist', () => {
    expect(() =>
      renderWithProviders(
        <EnforcePolicies policyIds={['non-existent-policy']} onAccept={noOp} />
      )
    ).toThrow('Required policy "non-existent-policy" cannot be loaded');
  });
});
