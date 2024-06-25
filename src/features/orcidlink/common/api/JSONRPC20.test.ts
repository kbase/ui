import fetchMock, { MockResponseInit } from 'jest-fetch-mock';
import { FetchMock } from 'jest-fetch-mock/types';
import {
  APIOverrides,
  jsonrpc20_response,
  makeBatchResponseObject,
} from '../../test/jsonrpc20ServiceMock';

import {
  assertJSONRPC20Response,
  assertPlainObject,
  batchResultOrThrow,
  JSONRPC20Client,
  JSONRPC20ResponseObject,
  notIn,
  resultOrThrow,
} from './JSONRPC20';

// Simulates latency in the request response; helps with detecting state driven
// by api calls which may not be detectable with tests if the mock rpc handling
// is too fast.
const RPC_DELAY = 300;

// Used in at least one test which simulates a request timeout.
const RPC_DELAY_TIMEOUT = 2000;

// The timeout used for most RPC calls (other than those to test timeout behavior)
const RPC_CALL_TIMEOUT = 1000;

describe('The JSONRPC20 assertPlainObject function', () => {
  it('correctly identifies a plain object', () => {
    const testCases = [
      {},
      { foo: 'bar' },
      { bar: 123 },
      { foo: { bar: { baz: 'buzz' } } },
    ];

    for (const testCase of testCases) {
      expect(() => {
        assertPlainObject(testCase);
      }).not.toThrow();
    }
  });
  it('correctly identifies a non-plain object', () => {
    const testCases = [new Date(), new Set(), null];

    for (const testCase of testCases) {
      expect(() => {
        assertPlainObject(testCase);
      }).toThrow();
    }
  });
});

describe('The JSONRPC20 diff function', () => {
  it('correctly identifies extra keys', () => {
    const testCases: Array<{
      params: [Array<unknown>, Array<unknown>];
      expected: Array<unknown>;
    }> = [
      {
        params: [
          [1, 2, 3],
          [1, 2, 3],
        ],
        expected: [],
      },

      {
        params: [
          [1, 2, 3, 4, 5, 6],
          [1, 2, 3],
        ],
        expected: [4, 5, 6],
      },
    ];

    for (const { params, expected } of testCases) {
      expect(notIn(...params)).toEqual(expected);
    }
  });
});

describe('The JSONRPC20 assertJSONRPC20Response function', () => {
  it('correctly identifies a valid JSON-RPC 2.0 response', () => {
    const testCases: Array<unknown> = [
      {
        jsonrpc: '2.0',
        id: '123',
        result: null,
      },

      {
        jsonrpc: '2.0',
        id: '123',
        result: 'foo',
      },
      {
        jsonrpc: '2.0',
        id: '123',
        error: {
          code: 123,
          message: 'an error',
        },
      },
      {
        jsonrpc: '2.0',
        id: '123',
        error: {
          code: 123,
          message: 'an error',
          data: { some: 'details' },
        },
      },
    ];

    for (const testCase of testCases) {
      expect(() => {
        assertJSONRPC20Response(testCase);
      }).not.toThrow();
    }
  });

  it('correctly identifies an invalid JSON-RPC 2.0 response', () => {
    const testCases: Array<{ param: unknown; expected: string }> = [
      { param: 'x', expected: 'JSON-RPC 2.0 response must be an object' },
      {
        param: null,
        expected: 'JSON-RPC 2.0 response must be a non-null object',
      },
      {
        param: new Date(),
        expected: 'JSON-RPC 2.0 response must be a plain object',
      },
      {
        param: {
          jsonrpc: '2.0',
          id: '123',
        },
        expected:
          'JSON-RPC 2.0 response must include either "result" or "error"',
      },
      {
        param: {
          jsonrpc: '2.0',
          result: null,
        },
        expected: 'JSON-RPC 2.0 response must have the "id" property',
      },
      {
        param: {
          id: '123',
          result: null,
        },
        expected: 'JSON-RPC 2.0 response must have the "jsonrpc" property',
      },
      {
        param: {
          jsonrpc: 'X',
          id: '123',
          result: null,
        },
        expected:
          'JSON-RPC 2.0 response "jsonrpc" property must be the string "2.0"',
      },
      {
        param: {
          jsonrpc: '2.0',
          id: ['x'],
          result: null,
        },
        expected:
          'JSON-RPC 2.0 response "id" property must be a string, number or null',
      },
      {
        param: {
          jsonrpc: '2.0',
          id: '123',
          error: 'foo',
        },
        expected:
          'JSON-RPC 2.0 response "error" property must be a plain object',
      },
      {
        param: {
          jsonrpc: '2.0',
          id: '123',
          error: {
            code: 123,
          },
        },
        expected:
          'JSON-RPC 2.0 response "error" property must have a "message" property',
      },
      {
        param: {
          jsonrpc: '2.0',
          id: '123',
          error: {
            message: 'an error',
          },
        },
        expected:
          'JSON-RPC 2.0 response "error" property must have a "code" property',
      },
      {
        param: {
          jsonrpc: '2.0',
          id: '123',
          error: {
            foo: 123,
            bar: 'baz',
          },
        },
        expected:
          'JSON-RPC 2.0 response "error" property has extra keys: foo, bar',
      },
      {
        param: {
          jsonrpc: '2.0',
          id: '123',
          error: {
            code: 'foo',
            message: 'bar',
          },
        },
        expected:
          'JSON-RPC 2.0 response "error.code" property must be an integer',
      },
      {
        param: {
          jsonrpc: '2.0',
          id: '123',
          error: {
            code: 123,
            message: 456,
          },
        },
        expected:
          'JSON-RPC 2.0 response "error.message" property must be an string',
      },
    ];

    for (const { param, expected } of testCases) {
      expect(() => {
        assertJSONRPC20Response(param);
      }).toThrowError(expected);
    }
  });
});

describe('The JSONRPC20 resultOrThrow function works as expected', () => {
  it('simply returns the result if found', () => {
    const testCase: JSONRPC20ResponseObject = {
      jsonrpc: '2.0',
      id: '123',
      result: 'fuzz',
    };
    expect(resultOrThrow(testCase)).toEqual(testCase.result);
  });

  it('throws if an error is returned', () => {
    const testCase: JSONRPC20ResponseObject = {
      jsonrpc: '2.0',
      id: '123',
      error: {
        code: 123,
        message: 'An Error',
      },
    };
    expect(() => {
      resultOrThrow(testCase);
    }).toThrow('An Error');
  });
});

describe('The JSONRPC20 batchResultOrThrow function works as expected', () => {
  it('simply returns the result if found', () => {
    const responseResult: JSONRPC20ResponseObject = {
      jsonrpc: '2.0',
      id: '123',
      result: 'fuzz',
    };
    const testCase: Array<JSONRPC20ResponseObject> = [responseResult];
    expect(batchResultOrThrow(testCase)).toEqual([responseResult.result]);
  });

  it('throws if an error is returned', () => {
    const testCase: Array<JSONRPC20ResponseObject> = [
      {
        jsonrpc: '2.0',
        id: '123',
        error: {
          code: 123,
          message: 'An Error',
        },
      },
    ];
    expect(() => {
      batchResultOrThrow(testCase);
    }).toThrow('An Error');
  });
});

async function pause(duration: number) {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, duration);
  });
}

/**
 *
 * @param request The mock request
 * @param method The rpc method
 * @param params The rpc params
 * @returns A JSON-RPC 2.0 response object
 */
async function jsonrpc20MethodResponse(
  request: Request,
  method: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _params: any
): Promise<JSONRPC20ResponseObject> {
  switch (method) {
    case 'foo':
      return {
        jsonrpc: '2.0',
        id: '123',
        result: 'fuzz',
      };
    case 'bar': {
      return {
        jsonrpc: '2.0',
        id: '123',
        result: 'buzz',
      };
    }
    case 'baz': {
      if (request.headers.get('authorization') === 'my_token') {
        return {
          jsonrpc: '2.0',
          id: '123',
          result: 'is authorized',
        };
      } else {
        return {
          jsonrpc: '2.0',
          id: '123',
          error: {
            code: 123,
            message: 'Not Authorized',
            data: {
              foo: 'bar',
            },
          },
        };
      }
    }
    case 'error': {
      return {
        jsonrpc: '2.0',
        id: '123',
        error: {
          code: 123,
          message: 'An Error',
          data: {
            foo: 'bar',
          },
        },
      };
    }
    case 'timeout': {
      await pause(RPC_DELAY_TIMEOUT);
      return {
        jsonrpc: '2.0',
        id: '123',
        result: 'fuzz',
      };
    }

    default:
      throw new Error('case not handled');
  }
}

async function jsonrpc20Response(
  request: Request,
  method: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any
) {
  switch (method) {
    case 'not_json':
      return {
        body: 'foo',
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      };
    default: {
      const response = await jsonrpc20MethodResponse(request, method, params);
      return jsonrpc20_response(response);
    }
  }
}

export function makeJSONRPC20Server(overrides: APIOverrides = {}) {
  return fetchMock.mockResponse(
    async (request): Promise<MockResponseInit | string> => {
      const { pathname } = new URL(request.url);
      // put a little delay in here so that we have a better
      // chance of catching temporary conditions, like loading.
      await pause(RPC_DELAY);
      switch (pathname) {
        // Mocks for the orcidlink api
        case '/services/foo': {
          if (request.method !== 'POST') {
            return '';
          }
          const body = await request.json();

          if (body instanceof Array) {
            // batch case; normal request wrapped in an array; response array
            // mirrors request.
            const responses = await Promise.all(
              body.map((rpc) => {
                const method = rpc['method'];
                const params = rpc['params'];
                return jsonrpc20MethodResponse(request, method, params);
              })
            );
            return makeBatchResponseObject(responses);
          } else {
            // single request
            const method = body['method'];
            const params = body['params'];
            return jsonrpc20Response(request, method, params);
          }
        }
        case '/services/bad_batch': {
          return jsonrpc20Response(request, 'foo', {});
        }
        default:
          throw new Error('case not handled');
      }
    }
  );
}

describe('The JSONRPC20 client', () => {
  let mockService: FetchMock;

  beforeEach(() => {
    fetchMock.enableMocks();
    fetchMock.doMock();
    mockService = makeJSONRPC20Server();
  });
  afterEach(() => {
    mockService.mockClear();
    fetchMock.disableMocks();
  });

  it('correctly invokes simple POST endpoint', async () => {
    const rpc = {
      jsonrpc: '2.0',
      id: '123',
      method: 'foo',
      params: {
        bar: 'baz',
      },
    };
    const expected = {
      jsonrpc: '2.0',
      id: '123',
      result: 'fuzz',
    };
    const headers = new Headers();
    headers.set('content-type', 'application/json');
    headers.set('accept', 'application/json');

    // use a timeout detection duration tht is 1/2 of the testing delay used to
    // force timeout.
    const timeout = RPC_DELAY_TIMEOUT / 2;
    const controller = new AbortController();
    const timeoutTimer = window.setTimeout(() => {
      controller.abort('Timeout');
    }, timeout);
    // const expected = { baz: 'buzzer' }
    const response = await fetch('http://example.com/services/foo', {
      method: 'POST',
      body: JSON.stringify(rpc),
      headers,
      mode: 'cors',
      signal: controller.signal,
    });
    clearTimeout(timeoutTimer);
    const result = await response.json();
    expect(result).toEqual(expected);
  });

  it('correctly invokes fictitious service', async () => {
    const client = new JSONRPC20Client({
      url: 'http://example.com/services/foo',
      timeout: RPC_DELAY_TIMEOUT,
    });

    const expected = {
      jsonrpc: '2.0',
      id: '123',
      result: 'fuzz',
    };

    const result = await client.callMethod('foo', { baz: 'buzz' });
    expect(result).toEqual(expected);
  });

  it('correctly invokes fictitious service with a batch request', async () => {
    const client = new JSONRPC20Client({
      url: 'http://example.com/services/foo',
      timeout: RPC_CALL_TIMEOUT,
    });

    const expected = [
      {
        jsonrpc: '2.0',
        id: '123',
        result: 'fuzz',
      },
      {
        jsonrpc: '2.0',
        id: '123',
        result: 'buzz',
      },
    ];

    const result = await client.callBatch([
      { method: 'foo', params: { baz: 'buzz' } },
      { method: 'bar', params: { baz: 'buzz' } },
    ]);
    expect(result).toEqual(expected);
  });

  it('correctly invokes fictitious service 2', async () => {
    const client = new JSONRPC20Client({
      url: 'http://example.com/services/foo',
      timeout: RPC_CALL_TIMEOUT,
    });

    const expected = {
      jsonrpc: '2.0',
      id: '123',
      result: 'buzz',
    };

    const result = await client.callMethod('bar', { baz: 'buzz' });
    expect(result).toEqual(expected);
  });

  it('correctly invokes method with authorization', async () => {
    const client = new JSONRPC20Client({
      url: 'http://example.com/services/foo',
      timeout: RPC_CALL_TIMEOUT,
      token: 'my_token',
    });

    const expected = {
      jsonrpc: '2.0',
      id: '123',
      result: 'is authorized',
    };

    const result = await client.callMethod('baz', { baz: 'buzz' });
    expect(result).toEqual(expected);
  });

  it('correctly invokes method which returns an error', async () => {
    const client = new JSONRPC20Client({
      url: 'http://example.com/services/foo',
      timeout: RPC_CALL_TIMEOUT,
    });

    const expected = {
      jsonrpc: '2.0',
      id: '123',
      error: {
        code: 123,
        message: 'An Error',
        data: {
          foo: 'bar',
        },
      },
    };

    const result = await client.callMethod('error', { baz: 'buzz' });
    expect(result).toEqual(expected);
  });

  it('correctly invokes fictitious service with a batch request which returns an error', async () => {
    const client = new JSONRPC20Client({
      url: 'http://example.com/services/foo',
      timeout: RPC_CALL_TIMEOUT,
    });

    const expected = [
      {
        jsonrpc: '2.0',
        id: '123',
        error: {
          code: 123,
          message: 'An Error',
          data: {
            foo: 'bar',
          },
        },
      },
    ];

    const result = await client.callBatch([
      { method: 'error', params: { baz: 'buzz' } },
    ]);
    expect(result).toEqual(expected);
  });

  it('correctly invokes service with a batch request which is not an array', async () => {
    const client = new JSONRPC20Client({
      url: 'http://example.com/services/bad_batch',
      timeout: RPC_CALL_TIMEOUT,
    });

    expect(async () => {
      await client.callBatch([
        { method: 'foo', params: { baz: 'buzz' } },
        { method: 'bar', params: { baz: 'buzz' } },
      ]);
    }).rejects.toThrow('JSON-RPC 2.0 batch response must be an array');
  });

  it('times out as expected', async () => {
    const client = new JSONRPC20Client({
      url: 'http://example.com/services/foo',
      timeout: 100,
    });

    fetchMock.mockAbort();

    // cannot use the appended abort error message, as it is different in
    // jest-fetch-mock than browsers, and there is no way to supply the message.
    await expect(client.callMethod('timeout', { baz: 'buzz' })).rejects.toThrow(
      /Connection error AbortError:/
    );
  });

  it('throws if no endpoint detected', async () => {
    const client = new JSONRPC20Client({
      url: 'http://example.com/services/foo',
      timeout: RPC_CALL_TIMEOUT,
    });

    fetchMock.mockReject(new Error('Request error: Network request failed'));

    await expect(
      client.callMethod('network_fail', { baz: 'buzz' })
    ).rejects.toThrow('Request error: Network request failed');
  });

  it('throws if non-json returned', async () => {
    const client = new JSONRPC20Client({
      url: 'http://example.com/services/foo',
      timeout: RPC_CALL_TIMEOUT,
    });

    // server.passthrough();

    await expect(
      client.callMethod('not_json', { baz: 'buzz' })
    ).rejects.toThrow('The response from the service could not be parsed');
  });
});
