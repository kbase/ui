import { SerializedError } from '@reduxjs/toolkit';
import { KBaseBaseQueryError } from './common';

export function parseError(error: KBaseBaseQueryError | SerializedError): {
  error: KBaseBaseQueryError | SerializedError;
  message: string;
  code?: string | number;
  name?: string;
  status?: number | string;
  stack?: string;
} {
  if ('status' in error) {
    // KBaseBaseQueryError
    if (error.status === 'JSONRPC_ERROR') {
      // jsonRPC error
      return {
        message: error.data.error.message,
        code: error.data.error.code,
        name: error.data.error.name,
        status: error.status,
        error,
      };
    } else {
      // FetchBaseQueryError
      const message =
        'error' in error ? error.error : JSON.stringify(error.data);
      return {
        message: message,
        status: error.status,
        error,
      };
    }
  } else {
    return {
      ...error,
      message: error.message || '',
      error,
    };
  }
}
