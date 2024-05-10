/* api/utils/common */
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
/*
JSONRPC Specification details
JSON-RPC 1.0 - https://www.jsonrpc.org/specification_v1
JSON-RPC 1.1 wd - https://jsonrpc.org/historical/json-rpc-1-1-wd.html
JSON-RPC 2.0 - https://www.jsonrpc.org/specification
- id
  - 2.0 allows id to be string, number (with no fractional part) or null
  - 1.1 allows id to be "any JSON type"
- version
  - a string in both JSONRPC 1.1 and 2.0.
*/
// KBase mostly uses strings, or string serializable values, so we can too.
type JsonRpcError = {
  version: '1.1';
  id: string;
  error: {
    name: string;
    code: number;
    message: string;
  };
};

// https://github.com/reduxjs/redux-toolkit/blob/7cd8142f096855eb7cd03fb54c149ebfdc7dd084/packages/toolkit/src/query/fetchBaseQuery.ts#L48
export type KBaseBaseQueryError =
  | FetchBaseQueryError
  | {
      status: 'JSONRPC_ERROR';
      data: JsonRpcError;
    };

export const isJsonRpcError = (obj: unknown): obj is JsonRpcError => {
  if (
    typeof obj === 'object' &&
    obj !== null &&
    ['version', 'error', 'id'].every((k) => k in obj)
  ) {
    const { version, error } = obj as { version: string; error: unknown };
    const versionsSupported = new Set(['1.1', '2.0']);
    if (!versionsSupported.has(version)) return false;
    if (
      typeof error === 'object' &&
      error !== null &&
      ['name', 'code', 'message'].every((k) => k in error)
    ) {
      return true;
    }
  }
  return false;
};

export const isJsonRpc20Error = (obj: unknown): obj is JsonRpcError => {
  if (
    typeof obj === 'object' &&
    obj !== null &&
    ['jsonrpc', 'error', 'id'].every((k) => k in obj)
  ) {
    const { jsonrpc, error } = obj as { jsonrpc: string; error: unknown };
    if (jsonrpc !== '2.0') {
      return false;
    }
    // const versionsSupported = new Set(['1.1', '2.0']);
    // if (!versionsSupported.has(version)) return false;
    if (
      typeof error === 'object' &&
      error !== null &&
      ['code', 'message'].every((k) => k in error)
    ) {
      return true;
    }
  }
  return false;
};

/**
 * Type predicate to narrow an unknown error to `FetchBaseQueryError`
 */
export function isFetchBaseQueryError(
  error: unknown
): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error;
}

export const isKBaseBaseQueryError = (
  error: unknown
): error is KBaseBaseQueryError => {
  const fbq = isFetchBaseQueryError(error);
  const condition = fbq && isJsonRpcError(error.data);
  return condition;
};
