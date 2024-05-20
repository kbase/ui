import { render } from '@testing-library/react';
import PrivateField from './PrivateField';

describe('The PrivateField component', () => {
  it('renders the expected text', () => {
    const { container } = render(<PrivateField />);
    expect(container).toHaveTextContent('private');
  });
});
