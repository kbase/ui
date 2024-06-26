/**
 * A base client for KBase services based on JSON-RPC 2.0
 *
 * Basically just a wrapper around JSONRPCE20.ts, but captures KBase usage
 * patterns. For example, KBase services typically have a "module name"
 * (essentially a service name or identifier), and construct the method name
 * from a concatenation of the module name and a method name. E.g. if the
 * service is "Foo" and the method "bar", the method name for the RPC call is
 * "Foo.bar". This is the pattern enforced by kb-sdk. But since kb-sdk only
 * supports JSON-RPC 1.1, we are free to use plain method names; in the example
 * above, simply "bar".
 *
 */

import {
  batchResultOrThrow,
  JSONRPC20Client,
  JSONRPC20Params,
  JSONRPC20Result,
  resultOrThrow,
} from './JSONRPC20';

export interface ServiceClientParams {
  url: string;
  timeout: number;
  token?: string;
}

export interface BatchParams {
  funcName: string;
  params?: JSONRPC20Params;
}

/**
 * The base class for all KBase JSON-RPC 1.1 services
 */
export abstract class ServiceClient {
  abstract module: string;
  abstract prefix: boolean;
  url: string;
  timeout: number;
  token?: string;

  constructor({ url, timeout, token }: ServiceClientParams) {
    this.url = url;
    this.timeout = timeout;
    this.token = token;
  }

  /**
   * The single point of entry for RPC calls, just to help dry out the class.
   *
   * @param funcName
   * @param params
   * @returns
   */

  public async callFunc(
    funcName: string,
    params?: JSONRPC20Params
  ): Promise<JSONRPC20Result> {
    const client = new JSONRPC20Client({
      url: this.url,
      timeout: this.timeout,
      token: this.token,
    });
    const method = (() => {
      if (this.prefix) {
        return `${this.module}.${funcName}`;
      } else {
        return funcName;
      }
    })();
    const result = await client.callMethod(method, params, {
      timeout: this.timeout,
    });
    return resultOrThrow(result);
  }

  public async callBatch(
    batch: Array<BatchParams>
  ): Promise<Array<JSONRPC20Result>> {
    const client = new JSONRPC20Client({
      url: this.url,
      timeout: this.timeout,
      token: this.token,
    });

    const batchParams = batch.map(({ funcName, params }) => {
      const method = (() => {
        if (this.prefix) {
          return `${this.module}.${funcName}`;
        } else {
          return funcName;
        }
      })();

      return { method, params };
    });

    const result = await client.callBatch(batchParams, {
      timeout: this.timeout,
    });
    return batchResultOrThrow(result);
  }
}
