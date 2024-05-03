import { render } from '@testing-library/react';
import { LinkRecordPublic } from '../../../common/api/orcidlinkAPI';
import Linked from './Linked';

describe('The Linked Component', () => {
  it('renders correctly', () => {
    const linkRecord: LinkRecordPublic = {
      username: 'foo',
      created_at: 123,
      expires_at: 456,
      retires_at: 789,
      orcid_auth: {
        name: 'bar',
        orcid: 'abc123',
        scope: 'baz',
        expires_in: 100,
      },
    };
    const { container } = render(<Linked linkRecord={linkRecord} />);

    expect(container).toHaveTextContent('abc123');
  });
});
