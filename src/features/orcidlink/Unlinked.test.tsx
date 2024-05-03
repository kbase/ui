import { render } from '@testing-library/react';
import Unlinked from './Unlinked';

describe('The Unlinked Component', () => {
  it('renders correctly', () => {
    const { container } = render(<Unlinked />);

    expect(container).toHaveTextContent(
      'Your KBase account is not linked to an ORCID account.'
    );
  });
});
