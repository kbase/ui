import { render, screen } from '@testing-library/react';
import 'core-js/stable/structured-clone';
import { ORCIDProfile } from '../../../common/api/orcidLinkCommon';
import { PROFILE_1 } from '../test/data';
import { renderCreditName, renderORCIDId, renderRealname } from './misc';

describe('The miscellaneous shared components module', () => {
  describe('the renderRealName render function ', () => {
    it('renders correctly if not private', () => {
      const profile = structuredClone<ORCIDProfile>(PROFILE_1);

      const { container } = render(renderRealname(profile));

      expect(container).toHaveTextContent('Foo Bar');
    });

    it('renders just the first name if no last name', () => {
      const profile = structuredClone<ORCIDProfile>(PROFILE_1);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      profile.nameGroup.fields!.lastName = null;

      const { container } = render(renderRealname(profile));

      expect(container).toHaveTextContent('Foo');
    });

    it('renders a special string if it is private', () => {
      const profile = structuredClone<ORCIDProfile>(PROFILE_1);
      profile.nameGroup.private = true;

      const { container } = render(renderRealname(profile));

      expect(container).toHaveTextContent('private');
    });
  });

  describe('The renderCreditName render function', () => {
    it('renders correctly if not private', () => {
      const profile = structuredClone<ORCIDProfile>(PROFILE_1);

      const { container } = render(renderCreditName(profile));

      expect(container).toHaveTextContent('Foo B. Bar');
    });

    it('renders a special string if it is private', () => {
      const profile = structuredClone<ORCIDProfile>(PROFILE_1);

      profile.nameGroup.private = true;

      const { container } = render(renderCreditName(profile));

      expect(container).toHaveTextContent('private');
    });

    it('renders a "not available" string if it is absent', () => {
      const profile = structuredClone<ORCIDProfile>(PROFILE_1);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      profile.nameGroup.fields!.creditName = null;

      const { container } = render(renderCreditName(profile));

      expect(container).toHaveTextContent('n/a');
    });
  });

  describe('The renderORCIDId render function', () => {
    it('renders an orcid id link', async () => {
      const baseURL = 'http://example.com';
      const orcidId = 'abc123';
      const expectedURL = `${baseURL}/${orcidId}`;

      const { container } = render(renderORCIDId(baseURL, orcidId));

      expect(container).toHaveTextContent(orcidId);

      const link = await screen.findByText(expectedURL);
      expect(link).toHaveAttribute('href', expectedURL);

      const image = await screen.findByAltText('ORCID Icon');
      expect(image).toBeVisible();
      expect(image.getAttribute('src')).toContain('ORCID-iD_icon-vector.svg');
    });
  });
});
