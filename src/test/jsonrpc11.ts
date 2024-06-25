/**
 * JSON-RPC/1.1 support for testing.
 *
 * Constrainted by KBase interpretation and usage of JSON-RPC/1.1.
 *
 * Only used in a few tests, so may need tweaking in the future to handle
 * additional use cases.
 */

import { MockResponseInit } from 'jest-fetch-mock/types';

export type JSONRPC11Id = string;

export type JSONRPC11Params = Array<unknown>;

// The entire JSON RPC request object
export interface JSONRPC11Request {
  version: '1.1';
  method: string;
  id?: JSONRPC11Id;
  params?: JSONRPC11Params;
}

export interface JSONRPC11Object {
  [key: string]: JSONRPC11Result;
}

export type JSONRPC11Result =
  | string
  | number
  | null
  | JSONRPC11Object
  | Array<JSONRPC11Result>;

// Response object

export interface JSONRPC11BaseResponse {
  version: '1.1';
  id?: JSONRPC11Id;
}

export interface JSONRPC11ResultResponse extends JSONRPC11BaseResponse {
  result: JSONRPC11Result;
}

export interface JSONRPC11ErrorResponse extends JSONRPC11BaseResponse {
  error: JSONRPC11Error;
}

export type JSONRPC11Response =
  | JSONRPC11ResultResponse
  | JSONRPC11ErrorResponse;

export interface JSONRPC11Error {
  code: number;
  message: string;
  data?: unknown;
}

// These functions help us craft JSON-RPC 1.1 responses with minimal input.

export function jsonrpc11_resultResponse(
  id: string,
  result: unknown
): MockResponseInit {
  return {
    body: JSON.stringify({
      version: '1.1',
      id,
      result,
    }),
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  };
}

export function jsonrpc11_response(
  result: JSONRPC11Response
): MockResponseInit {
  return {
    body: JSON.stringify(result),
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  };
}

export function jsonrpc11_errorResponse(
  id: string,
  error: JSONRPC11Error
): MockResponseInit {
  return {
    body: JSON.stringify({
      version: '1.1',
      id,
      error,
    }),
    status: 500,
    headers: {
      'content-type': 'application/json',
    },
  };
}
