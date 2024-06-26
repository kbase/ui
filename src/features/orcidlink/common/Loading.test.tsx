import { render } from '@testing-library/react';
import Loading from './Loading';

const TEST_TITLE = 'Test Loading Title';
const TEST_MESSAGE = 'Test Loading Message';

describe('The Loading Component', () => {
  it('renders minimal correctly', () => {
    const { container } = render(<Loading title={TEST_TITLE} />);

    expect(container).toHaveTextContent(TEST_TITLE);
  });

  it('renders with all props correctly', () => {
    const { container } = render(
      <Loading title={TEST_TITLE} message={TEST_MESSAGE} />
    );

    expect(container).toHaveTextContent(TEST_TITLE);
    expect(container).toHaveTextContent(TEST_MESSAGE);
  });

  it('renders with children rather than message prop correctly', () => {
    const { container } = render(
      <Loading title={TEST_TITLE}>{TEST_MESSAGE}</Loading>
    );

    expect(container).toHaveTextContent(TEST_TITLE);
    expect(container).toHaveTextContent(TEST_MESSAGE);
  });
});
