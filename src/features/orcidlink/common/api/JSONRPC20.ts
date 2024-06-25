/**
 * A JSON-RPC 2.0 client
 *
 * It is intended to be fully compliant; where not, it is an oversight.
 * Code copied from kbase-ui and modified.
 * There is some accomodation for KBase (e.g. token may be used in authorization
 * header), but unlike the JSON-RPC 1.1 usage at KBase is more compliant with
 * the specs.
 */
import * as uuid from 'uuid';

export function assertPlainObject(
  value: unknown
): asserts value is JSONRPC20ResponseObject {
  if (typeof value !== 'object') {
    throw new Error('must be an object');
  }
  if (value === null) {
    throw new Error('must be a non-null object');
  }
  if (value.constructor !== Object) {
    throw new Error('must be a plain object');
  }
}

/**
 * Returns the values in a1 that are not in a2.
 *
 * @param a1
 * @param a2
 */
export function notIn(a1: Array<unknown>, a2: Array<unknown>) {
  return a1.filter((v1) => {
    return !a2.includes(v1);
  });
}

/**
 * Ensures that the given value is a JSON-RPC 2.0 compliant response
 *
 * Note that I'd rather use JSON Schema, but I can't get AJV and TS to play nicely.
 *
 * We make the assumption that the value is the result of JSON.parse(), so all
 * values are by definition JSON-compatible - no undefined, no non-plain
 * objects, no functions, etc.
 *
 * @param value
 */
export function assertJSONRPC20Response(
  value: unknown
): asserts value is JSONRPC20ResultResponseObject {
  if (typeof value !== 'object') {
    throw new Error('JSON-RPC 2.0 response must be an object');
  }
  if (value === null) {
    throw new Error('JSON-RPC 2.0 response must be a non-null object');
  }
  if (value.constructor !== Object) {
    throw new Error('JSON-RPC 2.0 response must be a plain object');
  }

  if (!('jsonrpc' in value)) {
    throw new Error('JSON-RPC 2.0 response must have the "jsonrpc" property');
  }

  if (value.jsonrpc !== '2.0') {
    throw new Error(
      'JSON-RPC 2.0 response "jsonrpc" property must be the string "2.0"'
    );
  }

  if ('id' in value) {
    if (
      !(['string', 'number'].includes(typeof value.id) && value.id !== null)
    ) {
      throw new Error(
        'JSON-RPC 2.0 response "id" property must be a string, number or null'
      );
    }
  } else {
    throw new Error('JSON-RPC 2.0 response must have the "id" property');
  }

  if ('result' in value) {
    // nothing to assert here? The result can be any valid JSON value.
  } else if ('error' in value) {
    try {
      assertPlainObject(value.error);
    } catch (ex) {
      throw new Error(
        'JSON-RPC 2.0 response "error" property must be a plain object'
      );
    }

    const extraKeys = notIn(Object.keys(value.error), [
      'code',
      'message',
      'data',
    ]);
    if (extraKeys.length > 0) {
      throw new Error(
        `JSON-RPC 2.0 response "error" property has extra keys: ${extraKeys.join(
          ', '
        )}`
      );
    }

    if (!('code' in value.error)) {
      throw new Error(
        'JSON-RPC 2.0 response "error" property must have a "code" property'
      );
    }
    if (!Number.isInteger(value.error.code)) {
      throw new Error(
        'JSON-RPC 2.0 response "error.code" property must be an integer'
      );
    }
    if (!('message' in value.error)) {
      throw new Error(
        'JSON-RPC 2.0 response "error" property must have a "message" property'
      );
    }
    if (typeof value.error.message !== 'string') {
      throw new Error(
        'JSON-RPC 2.0 response "error.message" property must be an string'
      );
    }
  } else {
    throw new Error(
      'JSON-RPC 2.0 response must include either "result" or "error"'
    );
  }
}

export function assertJSONRPC20BatchResponse(
  values: unknown
): asserts values is Array<JSONRPC20ResultResponseObject> {
  if (!(values instanceof Array)) {
    throw new Error('JSON-RPC 2.0 batch response must be an array');
  }

  for (const value of values) {
    assertJSONRPC20Response(value);
  }
}

export interface JSONRPC20ObjectParams {
  [key: string]: unknown;
}

export type JSONRPC20Params = JSONRPC20ObjectParams | Array<unknown>;

export type JSONRPC20Id = string | number | null;

// The entire JSON RPC request object
export interface JSONRPC20Request {
  jsonrpc: '2.0';
  method: string;
  id?: JSONRPC20Id;
  params?: JSONRPC20Params;
}

export type JSONRPC20Result =
  | string
  | number
  | null
  | Object
  | Array<JSONRPC20Result>;

export interface JSONRPC20ResultResponseObject {
  jsonrpc: '2.0';
  id?: JSONRPC20Id;
  result: JSONRPC20Result;
}

export interface JSONRPC20ErrorResponseObject {
  jsonrpc: '2.0';
  id?: JSONRPC20Id;
  error: JSONRPC20Error;
}

export interface JSONRPC20Error {
  code: number;
  message: string;
  data?: unknown;
}

export class JSONRPC20Exception extends Error {
  error: JSONRPC20Error;
  constructor(error: JSONRPC20Error) {
    super(error.message);
    this.error = error;
  }
}

export function batchResultOrThrow(
  responses: JSONRPC20BatchResponse
): Array<JSONRPC20Result> {
  return responses.map((response) => {
    if ('result' in response) {
      return response.result;
    }
    throw new JSONRPC20Exception(response.error);
  });
}

export function resultOrThrow(
  response: JSONRPC20ResponseObject
): JSONRPC20Result {
  if ('result' in response) {
    return response.result;
  }
  throw new JSONRPC20Exception(response.error);
}

export type JSONRPC20ResponseObject =
  | JSONRPC20ResultResponseObject
  | JSONRPC20ErrorResponseObject;

export type JSONRPC20BatchResponse = Array<JSONRPC20ResponseObject>;

export class ConnectionError extends Error {}

export class RequestError extends Error {}

/**
 * Constructor parameters
 */
export interface JSONRPC20ClientParams {
  url: string;
  timeout: number;
  token?: string;
}

export interface JSONRPC20CallParams {
  method: string;
  params?: JSONRPC20Params;
}

/**
 * A JSON-RPC 2.0 client, with some accomodation for KBase usage (e.g. token)
 */
export class JSONRPC20Client {
  url: string;
  timeout: number;
  token?: string;

  constructor({ url, timeout, token }: JSONRPC20ClientParams) {
    this.url = url;
    this.timeout = timeout;
    this.token = token;
  }

  /**
   * Given a method name and parameters, call the known endpoint, process the response,
   * and return the result.
   *
   * Exceptions included
   *
   * @param method JSON-RPC 2.0 method name
   * @param params JSON-RPC 2.0 parameters; must be an object or array
   * @param options An object containing optional parameters
   * @returns A
   */
  async callMethod(
    method: string,
    params?: JSONRPC20Params,
    { timeout }: { timeout?: number } = {}
  ): Promise<JSONRPC20ResponseObject> {
    // The innocuously named "payload" is the entire request object.
    const payload = {
      jsonrpc: '2.0',
      method,
      id: uuid.v4(),
      params,
    };

    const headers = new Headers();
    headers.set('content-type', 'application/json');
    headers.set('accept', 'application/json');
    if (this.token) {
      headers.set('authorization', this.token);
    }

    // The abort controller allows us to abort the request after a specific amount
    // of time passes.
    const controller = new AbortController();
    const timeoutTimer = window.setTimeout(() => {
      controller.abort('Timeout');
    }, timeout || this.timeout);

    let response;
    try {
      response = await fetch(this.url, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers,
        mode: 'cors',
        signal: controller.signal,
      });
    } catch (ex) {
      if (ex instanceof DOMException) {
        throw new ConnectionError(`Connection error ${ex.name}: ${ex.message}`);
      } else if (ex instanceof TypeError) {
        throw new RequestError(`Request error: ${ex.message}`);
      } else {
        // Should never occur.
        throw ex;
      }
    }
    clearTimeout(timeoutTimer);

    const responseText = await response.text();
    const responseStatus = response.status;
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (ex) {
      throw new JSONRPC20Exception({
        code: 100,
        message: 'The response from the service could not be parsed',
        data: {
          originalMessage: ex instanceof Error ? ex.message : 'Unknown error',
          responseText,
          responseStatus,
        },
      });
    }

    assertJSONRPC20Response(result);

    return result;
  }

  /**
   * Given a method name and parameters, call the known endpoint, process the response,
   * and return the result.
   *
   * Exceptions included
   *
   * @param method JSON-RPC 2.0 method name
   * @param params JSON-RPC 2.0 parameters; must be an object or array
   * @param options An object containing optional parameters
   * @returns A
   */
  async callBatch(
    calls: Array<JSONRPC20CallParams>,
    { timeout }: { timeout?: number } = {}
  ): Promise<JSONRPC20BatchResponse> {
    // The innocuously named "payload" is the entire request object.

    const payload = calls.map(({ method, params }) => {
      return {
        jsonrpc: '2.0',
        method,
        id: uuid.v4(),
        params,
      };
    });

    const headers = new Headers();
    headers.set('content-type', 'application/json');
    headers.set('accept', 'application/json');
    if (this.token) {
      headers.set('authorization', this.token);
    }

    // The abort controller allows us to abort the request after a specific amount
    // of time passes.
    const controller = new AbortController();
    const timeoutTimer = window.setTimeout(() => {
      controller.abort('Timeout');
    }, timeout || this.timeout);

    let response;
    try {
      response = await fetch(this.url, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers,
        mode: 'cors',
        signal: controller.signal,
      });
    } catch (ex) {
      if (ex instanceof DOMException) {
        throw new ConnectionError(`Connection error ${ex.name}: ${ex.message}`);
      } else if (ex instanceof TypeError) {
        throw new RequestError(`Request error: ${ex.message}`);
      } else {
        // Should never occur.
        throw ex;
      }
    }
    clearTimeout(timeoutTimer);

    const responseText = await response.text();
    const responseStatus = response.status;
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (ex) {
      throw new JSONRPC20Exception({
        code: 100,
        message: 'The response from the service could not be parsed',
        data: {
          originalMessage: ex instanceof Error ? ex.message : 'Unknown error',
          responseText,
          responseStatus,
        },
      });
    }

    assertJSONRPC20BatchResponse(result);

    return result;
  }
}
