import { render, screen } from '@testing-library/react';
import LoadingOverlay from './LoadingOverlay';

describe('LoadingOverlay Module', () => {
  test('renders with message', () => {
    const message = 'My Loading Overlay';
    render(<LoadingOverlay message={message} />);
    expect(screen.getByText(message)).toBeVisible();
  });

  test('renders with children', () => {
    const message = 'My Loading Overlay';
    render(
      <LoadingOverlay>
        <div>{message}</div>
      </LoadingOverlay>
    );
    expect(screen.getByText(message)).toBeVisible();
  });

  test('renders without message, no text visible', () => {
    const { container } = render(<LoadingOverlay />);
    expect(container).not.toHaveTextContent(/.+/);
  });
});
