import fetchMock from 'jest-fetch-mock';
import { FetchMock, MockResponseInit } from 'jest-fetch-mock/types';
import { API_CALL_TIMEOUT } from '../../test/data';
import {
  jsonrpc20_response,
  makeResultObject,
} from '../../test/jsonrpc20ServiceMock';
import { JSONRPC20ResponseObject } from './JSONRPC20';
import { ServiceClient } from './ServiceClient';

export function makeMyServiceMock() {
  function handleRPC(
    id: string,
    method: string,
    params: unknown
  ): JSONRPC20ResponseObject {
    switch (method) {
      case 'foo':
        return makeResultObject(id, 'bar');
      case 'FooModule.foo':
        return makeResultObject(id, 'RESULT FOR METHOD WITH MODULE PREFIX');
      case 'batch1':
        return makeResultObject(id, 'batch_response_1');
      case 'batch2':
        return makeResultObject(id, 'batch_response_2');
      case 'FooModule.batch1':
        return makeResultObject(id, 'batch_response_1');
      case 'FooModule.batch2':
        return makeResultObject(id, 'batch_response_2');
      default:
        // eslint-disable-next-line no-console
        console.debug('METHOD NOT HANDLED', method, params);
        throw new Error('method not handled');
    }
  }

  return fetchMock.mockResponse(
    async (request): Promise<MockResponseInit | string> => {
      const { pathname } = new URL(request.url);
      // put a little delay in here so that we have a better
      // chance of catching temporary conditions, like loading.
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 300);
      });
      switch (pathname) {
        // Mocks for the orcidlink api
        case '/myservice': {
          if (request.method !== 'POST') {
            return '';
          }
          const body = await request.json();

          const response:
            | JSONRPC20ResponseObject
            | Array<JSONRPC20ResponseObject> = (() => {
            if (body instanceof Array) {
              // batch
              return body.map((rpc) => {
                const id = rpc['id'];
                const method = rpc['method'];
                const params = rpc['params'];
                return handleRPC(id, method, params);
              });
            } else {
              // single reqquest
              const id = body['id'];
              const method = body['method'];
              const params = body['params'];
              return handleRPC(id, method, params);
            }
          })();

          return jsonrpc20_response(response);
        }
        default:
          // eslint-disable-next-line no-console
          console.debug('PATH NOT HANDLED', pathname);
          throw new Error('pathname not handled');
      }
    }
  );
}

describe('The ServiceClient abstract base class', () => {
  let mockService: FetchMock;

  beforeEach(() => {
    fetchMock.enableMocks();
    // fetchMock.doMock();
    mockService = makeMyServiceMock();
  });

  afterEach(() => {
    mockService.mockClear();
    fetchMock.disableMocks();
  });

  it('can be used to create a basic JSON-RPC 2.0 client without method prefix', async () => {
    class MyServiceClient extends ServiceClient {
      module = 'FooModule';
      prefix = false;

      async foo(): Promise<string> {
        const result = await this.callFunc('foo');
        return result as unknown as string;
      }
    }

    const client = new MyServiceClient({
      timeout: API_CALL_TIMEOUT,
      url: 'http://localhost/myservice',
    });

    expect(client).not.toBeNull();

    const result = await client.foo();

    expect(result).toBe('bar');
  });

  it('can be used to create a basic JSON-RPC 2.0 client with method prefix', async () => {
    class MyServiceClient extends ServiceClient {
      module = 'FooModule';
      prefix = true;

      async foo(): Promise<string> {
        const result = await this.callFunc('foo');
        return result as unknown as string;
      }
    }

    const client = new MyServiceClient({
      timeout: API_CALL_TIMEOUT,
      url: 'http://localhost/myservice',
    });

    expect(client).not.toBeNull();

    const result = await client.foo();

    expect(result).toBe('RESULT FOR METHOD WITH MODULE PREFIX');
  });

  it('can be used to create a basic JSON-RPC 2.0 client with batch support', async () => {
    class MyServiceClient extends ServiceClient {
      module = 'FooModule';
      prefix = false;

      async batch(): Promise<string> {
        const result = await this.callBatch([
          {
            funcName: 'batch1',
          },
          {
            funcName: 'batch2',
          },
        ]);
        return result as unknown as string;
      }
    }

    const client = new MyServiceClient({
      timeout: API_CALL_TIMEOUT,
      url: 'http://localhost/myservice',
    });

    expect(client).not.toBeNull();

    const result = await client.batch();

    expect(result).toBeInstanceOf(Array);
  });

  it('can be used to create a basic JSON-RPC 2.0 client with batch support and module name prefix', async () => {
    class MyServiceClient extends ServiceClient {
      module = 'FooModule';
      prefix = true;

      async batch(): Promise<string> {
        const result = await this.callBatch([
          {
            funcName: 'batch1',
          },
          {
            funcName: 'batch2',
          },
        ]);
        return result as unknown as string;
      }
    }

    const client = new MyServiceClient({
      timeout: API_CALL_TIMEOUT,
      url: 'http://localhost/myservice',
    });

    expect(client).not.toBeNull();

    const result = await client.batch();

    expect(result).toBeInstanceOf(Array);
  });
});
