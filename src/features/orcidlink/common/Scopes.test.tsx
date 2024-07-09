import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Scopes from './Scopes';

describe('The Scopes component', () => {
  it('renders scopes correctly', () => {
    const scopes = '/read-limited';
    const { container } = render(<Scopes scopes={scopes} />);
    const expectedText =
      'Allows KBase to read your information with visibility set to Trusted Organizations.';
    expect(container).toHaveTextContent(expectedText);
  });

  it('renders scope description when scope is selected', async () => {
    const user = userEvent.setup();
    const scopes = '/read-limited';

    render(<Scopes scopes={scopes} />);

    const buttonText =
      'Allows KBase to read your information with visibility set to Trusted Organizations.';
    const button = await screen.findByText(buttonText);
    expect(button).toBeVisible();
    await user.click(button);

    const revealedContentSample =
      'Allows KBase to read any information from your record';
    waitFor(async () => {
      expect(await screen.findByText(revealedContentSample)).toBeVisible();
    });
  });

  it('renders invalid scope ', async () => {
    const scopes = 'foo';
    render(<Scopes scopes={scopes} />);
    const expectedErrorMessage = 'Invalid scope: foo';
    expect(await screen.findByText(expectedErrorMessage)).toBeVisible();
  });
});
