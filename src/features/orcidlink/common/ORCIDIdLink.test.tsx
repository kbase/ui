import { render, screen } from '@testing-library/react';
import 'core-js/stable/structured-clone';
import { ORCIDIdLink } from './ORCIDIdLink';

describe('The renderORCIDId render function', () => {
  it('renders an orcid id link', async () => {
    const baseURL = 'http://example.com';
    const orcidId = 'abc123';
    const expectedURL = `${baseURL}/${orcidId}`;

    const { container } = render(
      <ORCIDIdLink url={baseURL} orcidId={orcidId} />
    );

    expect(container).toHaveTextContent(orcidId);

    const link = await screen.findByText(expectedURL);
    expect(link).toHaveAttribute('href', expectedURL);

    const image = await screen.findByAltText('ORCID Icon');
    expect(image).toBeVisible();
    expect(image.getAttribute('src')).toContain('ORCID-iD_icon-vector.svg');
  });
});
