import { render, screen } from '@testing-library/react';
import OverlayContainer from './OverlayContainer';

describe('OverlayContainer Module', () => {
  test('renders with children', () => {
    const message = 'My Loading Overlay';
    render(
      <OverlayContainer>
        <div>{message}</div>
      </OverlayContainer>
    );
    expect(screen.getByText(message)).toBeVisible();
  });

  test('renders without message, no text visible', () => {
    const { container } = render(<OverlayContainer />);
    expect(container).not.toHaveTextContent(/.+/);
  });
});
