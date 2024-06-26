/**
 * Support for creating mocks of JSON-RPC 2.0 services.
 *
 * Contains utility functions to reduce the repetetiveness of ressponses, and a
 * general-purpose mechanism for providing method implementations for testing
 * using jest-fetch-mock.
 *
 */
import { MockResponseInit } from 'jest-fetch-mock/types';
import {
  JSONRPC20Error,
  JSONRPC20Id,
  JSONRPC20Request,
  JSONRPC20ResponseObject,
  JSONRPC20Result,
} from '../common/api/JSONRPC20';

/**
 * Constructs a JSON-RPC 2.0 repsonse object with a result.
 */
export function makeResultObject(
  id: JSONRPC20Id,
  result: JSONRPC20Result
): JSONRPC20ResponseObject {
  return {
    jsonrpc: '2.0',
    id,
    result,
  };
}

/**
 * Construct a JSON-RPC 2.0 response with an error.
 */
export function makeErrorObject(
  id: JSONRPC20Id,
  error: JSONRPC20Error
): JSONRPC20ResponseObject {
  return {
    jsonrpc: '2.0',
    id,
    error,
  };
}

/**
 * Convenience function to create a JSON-RPC 2.0 batch response, either result or error, within a
 * jest-fetch-mock response
 *
 * JSON-RPC 2.0 has a batch mode, which can make multiple concurrent requests
 * more efficient and faster. We don't currently use batch mode, at least in
 * orcidlink, simply because it would take additional work to redesign the RTK
 * query support.
 *
 * Batch mode, btw, is supported by the orcidlink service.
 */
export function makeBatchResponseObject(
  result: Array<JSONRPC20ResponseObject>
): MockResponseInit {
  return {
    body: JSON.stringify(result),
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  };
}

/**
 * Convenience funciton to create a JSON-RPC 2.0 result response within a
 * jest-fetch-mock response
 */
export function jsonrpc20_resultResponse(
  id: JSONRPC20Id,
  result: JSONRPC20Result
): MockResponseInit {
  return {
    body: JSON.stringify(makeResultObject(id, result)),
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  };
}

/**
 * Convenience funciton to create a JSON-RPC 2.0 error response, either result or error, within a
 * jest-fetch-mock response
 */
export function jsonrpc20_errorResponse(
  id: JSONRPC20Id,
  error: JSONRPC20Error
): MockResponseInit {
  return {
    body: JSON.stringify(makeErrorObject(id, error)),
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  };
}

/**
 * Convenience funciton to create a JSON-RPC 2.0 response, either result or error, within a
 * jest-fetch-mock response.
 */
export function jsonrpc20_response(
  rpc: JSONRPC20ResponseObject | Array<JSONRPC20ResponseObject>
): MockResponseInit {
  return {
    body: JSON.stringify(rpc),
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  };
}

/**
 * The method spec is a mock implementation for one method in a service.
 */
export interface RPCMethodResultSpec {
  path: string;
  method: string;
  result: (request: JSONRPC20Request) => JSONRPC20Result;
}

export interface RPCMethodErrorSpec {
  path: string;
  method: string;
  error: (request: JSONRPC20Request) => JSONRPC20Error;
}

export type RPCMethodSpec = RPCMethodResultSpec | RPCMethodErrorSpec;

// Determines a little pause in the handling of a request.
const REQUEST_LATENCY = 300;

/**
 * Creates a general-purpose JSON-RPC 2.0 server to be used in tests via the
 * "jest-fetch-mock" library. The "specs" parameter provides any methods to be implemented.
 *
 * Note that the "jest-fetch-mock" provides the "fetchMock" variable globally
 * when "enableMocks()" is called in a test.
 * See https://www.npmjs.com/package/jest-fetch-mock
 */
export function makeJSONRPC20Server(specs: Array<RPCMethodSpec>) {
  fetchMock.mockResponse(
    async (request): Promise<MockResponseInit | string> => {
      const { pathname } = new URL(request.url);
      // put a little delay in here so that we have a better
      // chance of catching passing conditions, like loading.
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, REQUEST_LATENCY);
      });

      if (request.method !== 'POST') {
        return '';
      }

      const rpc = (await request.json()) as JSONRPC20Request;

      const id = rpc.id;
      if (!id) {
        throw new Error('Id must be provided (we do not use notifications)');
      }

      for (const spec of specs) {
        const { path, method } = spec;
        if (!(path === pathname && method === rpc['method'])) {
          continue;
        }
        if ('result' in spec) {
          return jsonrpc20_resultResponse(id, spec.result(rpc));
        } else {
          return jsonrpc20_errorResponse(id, spec.error(rpc));
        }
      }

      // If a service method is called, but is not mocked in the "specs", then
      // this error should be displayed somewhere in the test failure. This is
      // never an expected condition, and indicates that the mock server
      // implementation is not complete, or a api call is incorrect during testing.
      throw new Error(`NOT HANDLED: ${pathname}, ${rpc.method}`);
    }
  );
}

export type APIOverrides = Record<
  string,
  Record<string, (request: JSONRPC20Request) => JSONRPC20ResponseObject>
>;

export function getOverride(
  method: string,
  param: string,
  overrides: APIOverrides
) {
  if (!(method in overrides)) {
    return;
  }

  const overrideMethod = overrides[method];

  if (!(param in overrideMethod)) {
    return;
  }

  return overrideMethod[param];
}
