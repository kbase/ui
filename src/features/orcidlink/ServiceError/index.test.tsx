import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ServiceErrorController from './index';

describe('The ServiceError view component', () => {
  it('renders correctly', () => {
    const TEST_CODE = '123';
    const TEST_MESSAGE = 'My Error Message';
    const { container } = render(
      <MemoryRouter
        initialEntries={[
          `/orcidlink/error?code=${TEST_CODE}&message=${encodeURIComponent(
            TEST_MESSAGE
          )}`,
        ]}
      >
        <ServiceErrorController />
      </MemoryRouter>
    );

    expect(container).toHaveTextContent(TEST_CODE);
    expect(container).toHaveTextContent(TEST_MESSAGE);
  });

  it('renders correctly if params missing', () => {
    const testCases: Array<Record<string, string>> = [
      {
        code: '123',
      },
      {
        message: 'My Error Message',
      },
      {},
    ];
    for (const testCase of testCases) {
      const searchParams = new URLSearchParams(testCase);
      const { container } = render(
        <MemoryRouter
          initialEntries={[
            `/orcidlink/error?${searchParams.toString()}
            )}`,
          ]}
        >
          <ServiceErrorController />
        </MemoryRouter>
      );

      if ('code' in testCase) {
        expect(container).toHaveTextContent(testCase.code);
      }
      if ('message' in testCase) {
        expect(container).toHaveTextContent(testCase.message);
      }
      expect(container).toHaveTextContent('n/a');
    }
  });
});
