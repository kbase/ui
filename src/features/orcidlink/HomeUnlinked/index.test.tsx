import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomeUnlinked from '.';

describe('The HomeUnlinked Component', () => {
  it('renders correctly', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/foo']}>
        <HomeUnlinked />
      </MemoryRouter>
    );

    expect(container).toHaveTextContent(
      'You do not currently have a link from your KBase account to an ORCID® account.'
    );
  });
});
