import { SerializedError } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { KBaseBaseQueryError } from '../../common/api/utils/common';
import ErrorMessage from './ErrorMessage';

describe('The ErrorMessage Component', () => {
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
  it('renders TIMEOUT_ERROR correctly', () => {
    const error: KBaseBaseQueryError = {
      status: 'TIMEOUT_ERROR',
      error: 'foo',
      data: 'bar',
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

    expect(container).toHaveTextContent('Unknown Error');
  });
});
