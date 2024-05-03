import { render } from '@testing-library/react';
import Home from './Home';

jest.mock('../Linked', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>Mocked Linked Component</div>;
    },
  };
});

describe('The Home Component', () => {
  it('renders correctly for unlinked', () => {
    const { container } = render(<Home isLinked={false} />);

    expect(container).not.toBeNull();
    expect(container).toHaveTextContent(
      'Your KBase account is not linked to an ORCID account.'
    );
  });

  it('renders correctly for linked', () => {
    const { container } = render(<Home isLinked={true} />);

    expect(container).not.toBeNull();
    expect(container).toHaveTextContent('Mocked Linked Component');
  });
});
