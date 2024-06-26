import { render } from '@testing-library/react';
import ServiceErrorView from './view';

describe('The ServiceError view component', () => {
  it('renders correctly', () => {
    const TEST_CODE = '123';
    const TEST_MESSAGE = 'My Error Message';
    const { container } = render(
      <ServiceErrorView code={TEST_CODE} message={TEST_MESSAGE} />
    );

    expect(container).toHaveTextContent(TEST_CODE);
    expect(container).toHaveTextContent(TEST_MESSAGE);
  });
});
