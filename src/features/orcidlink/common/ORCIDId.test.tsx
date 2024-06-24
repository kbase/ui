import { render } from '@testing-library/react';
import ORCIDId from './ORCIDId';

describe('The ORCIDId Component', () => {
  it('renders minimal correctly', () => {
    const ID = 'foo';
    const { container } = render(<ORCIDId orcidId={ID} />);

    expect(container).toHaveTextContent(ID);
  });
});
