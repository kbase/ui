import { render } from '@testing-library/react';
import Root from '.';

describe('Europa...', () => {
  test('exists.', () => {
    const { container } = render(<Root />);
    expect(container).toBeTruthy();
  });
});
