import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';
import { render, screen } from '@testing-library/react';
import { KBaseBaseQueryError } from '../../../common/api/utils/common';
import ErrorMessage, { CommonError, makeCommonError } from './ErrorMessage';

describe('The ErrorMessage Component for KBaseBaseQueryError', () => {
  it('renders CUSTOM_ERROR correctly', () => {
    const error: KBaseBaseQueryError = {
      status: 'CUSTOM_ERROR',
      error: 'foo',
    };
    const { container } = render(<ErrorMessage error={error} />);

    expect(container).toHaveTextContent('foo');
  });
  it('renders JSONRPC_ERROR correctly', () => {
    // TODO: the JSON-RPC error should NOT contain the entire response body.
    // This will not work for JSON-RPC 2.0, and the information is not helpful.
    const error: KBaseBaseQueryError = {
      status: 'JSONRPC_ERROR',
      data: {
        version: '1.1',
        id: '123',
        error: {
          name: 'bar',
          code: 123,
          message: 'foo',
        },
      },
    };
    const { container } = render(<ErrorMessage error={error} />);

    expect(container).toHaveTextContent('foo');
  });
  it('renders FETCH_ERROR correctly', () => {
    const error: KBaseBaseQueryError = {
      status: 'FETCH_ERROR',
      error: 'bar',
    };
    const { container } = render(<ErrorMessage error={error} />);

    expect(container).toHaveTextContent('bar');
  });
  it('renders PARSING_ERROR correctly', () => {
    const error: KBaseBaseQueryError = {
      status: 'PARSING_ERROR',
      error: 'baz',
      data: 'fuzz',
      originalStatus: 123,
    };
    const { container } = render(<ErrorMessage error={error} />);

    expect(container).toHaveTextContent('baz');
  });

  // TODO: type error for TIMEOUT_ERROR below - figure it out and fix, disabled
  // for now because it is all crap.

  it('renders TIMEOUT_ERROR correctly', () => {
    const error: FetchBaseQueryError = {
      status: 'TIMEOUT_ERROR',
      error: 'foo',
    };
    const { container } = render(<ErrorMessage error={error} />);

    expect(container).toHaveTextContent('foo');
  });

  it('renders an http error correctly', () => {
    const error: KBaseBaseQueryError = {
      status: 400,
      data: 'bar',
    };
    const { container } = render(<ErrorMessage error={error} />);

    expect(container).toHaveTextContent(`HTTP Status Code: ${400}`);
  });
});

describe('The ErrorMessage Component for SerializedError', () => {
  it('renders a Redux SerializedError error with a message correctly', () => {
    const error: SerializedError = {
      code: '123',
      message: 'foo',
      name: 'bar',
      stack: 'baz',
    };
    const { container } = render(<ErrorMessage error={error} />);

    expect(container).toHaveTextContent('foo');
  });

  it('renders a Redux SerializedError error without a message correctly', () => {
    const error: SerializedError = {
      code: '123',
      name: 'bar',
      stack: 'baz',
    };
    const { container } = render(<ErrorMessage error={error} />);

    expect(container).toHaveTextContent('Unknown error');
  });
});

const TEST_ERROR_MESSAGE = 'Test Error Message';
const TEST_ERROR_DETAILS = 'Test Error Details';
const TEST_ERROR_TITLE = 'Test Error Title';
const TEST_SOLUTION_DESCRIPTION = 'MY SOLUTION';
const TEST_SOLUTION_LABEL = 'MY SOLUTION LINK LABEL';
const TEST_SOLUTION_URL = 'http://example.com';

describe('The ErrorMessage Component for CommonError', () => {
  it('renders minimal error correctly', () => {
    const error: CommonError = makeCommonError({
      message: TEST_ERROR_MESSAGE,
    });
    const { container } = render(<ErrorMessage error={error} />);

    expect(container).toHaveTextContent(TEST_ERROR_MESSAGE);
  });

  it('renders error with details and title correctly', () => {
    const error: CommonError = makeCommonError({
      message: TEST_ERROR_MESSAGE,
      details: TEST_ERROR_DETAILS,
      title: TEST_ERROR_TITLE,
    });
    const { container } = render(<ErrorMessage error={error} />);

    expect(container).toHaveTextContent(TEST_ERROR_MESSAGE);
    expect(container).toHaveTextContent(TEST_ERROR_DETAILS);
    expect(container).toHaveTextContent(TEST_ERROR_TITLE);
  });

  it('renders error with minimal solution', async () => {
    const error: CommonError = makeCommonError({
      message: TEST_ERROR_MESSAGE,
      details: TEST_ERROR_DETAILS,
      title: TEST_ERROR_TITLE,
      solutions: [
        {
          description: TEST_SOLUTION_DESCRIPTION,
        },
      ],
    });
    const { container } = render(<ErrorMessage error={error} />);

    expect(container).toHaveTextContent(TEST_ERROR_MESSAGE);
    expect(container).toHaveTextContent(TEST_ERROR_DETAILS);
    expect(container).toHaveTextContent(TEST_ERROR_TITLE);
    expect(container).toHaveTextContent(TEST_SOLUTION_DESCRIPTION);
    expect(container).toHaveTextContent(TEST_ERROR_TITLE);
  });

  it('renders error with full solution', async () => {
    const error: CommonError = makeCommonError({
      message: TEST_ERROR_MESSAGE,
      details: TEST_ERROR_DETAILS,
      title: TEST_ERROR_TITLE,
      solutions: [
        {
          description: TEST_SOLUTION_DESCRIPTION,
          link: {
            label: TEST_SOLUTION_LABEL,
            url: TEST_SOLUTION_URL,
          },
        },
      ],
    });
    const { container } = render(<ErrorMessage error={error} />);

    expect(container).toHaveTextContent(TEST_ERROR_MESSAGE);
    expect(container).toHaveTextContent(TEST_ERROR_DETAILS);
    expect(container).toHaveTextContent(TEST_ERROR_TITLE);
    expect(container).toHaveTextContent(TEST_SOLUTION_DESCRIPTION);
    expect(container).toHaveTextContent(TEST_SOLUTION_LABEL);
    expect(container).toHaveTextContent(TEST_ERROR_TITLE);

    const solutionLink = await screen.findByText(TEST_SOLUTION_LABEL);

    expect(solutionLink).toBeVisible();
    expect(solutionLink).toHaveAttribute('href', TEST_SOLUTION_URL);
  });
});
