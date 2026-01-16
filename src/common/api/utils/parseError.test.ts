import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { KBaseBaseQueryError } from './common';
import { parseError } from './parseError';

describe('parseError', () => {
  test('Parses FetchBaseQueryError', () => {
    const err: FetchBaseQueryError = {
      status: 'FETCH_ERROR',
      data: undefined,
      error: 'something',
    };
    expect(parseError(err)).toMatchObject({
      error: err,
      message: 'something',
    });
  });

  test('Parses KBaseBaseQueryError (JSONRPC_ERROR)', () => {
    const err: KBaseBaseQueryError = {
      status: 'JSONRPC_ERROR',
      data: {
        error: { code: 500, message: 'something else', name: 'name' },
        id: '0',
        version: '1.1',
      },
    };
    expect(parseError(err)).toMatchObject({
      error: err,
      message: 'something else',
      name: 'name',
    });
  });

  test('Parses SerializedError', () => {
    const err: SerializedError = {
      code: '500',
      message: 'one last thing',
      name: 'Another name',
    };
    expect(parseError(err)).toMatchObject({
      error: err,
      message: 'one last thing',
      name: 'Another name',
    });
  });

  test('Parses SerializedError, empty message', () => {
    const err: SerializedError = {
      code: '500',
      message: undefined,
      name: 'Another name',
    };
    expect(parseError(err)).toMatchObject({
      error: err,
      message: '',
      name: 'Another name',
    });
  });
});
