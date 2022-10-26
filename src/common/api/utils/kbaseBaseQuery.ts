import { BaseQueryApi } from '@reduxjs/toolkit/dist/query/baseQueryTypes';
import { FetchBaseQueryArgs } from '@reduxjs/toolkit/dist/query/fetchBaseQuery';
import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { RootState } from '../../../app/store';
import { serviceWizardApi } from '../serviceWizardApi';

export interface DynamicService {
  name: string;
  release: string;
}

export interface StaticService {
  url: string;
}

export interface JsonRpcQueryArgs {
  apiType: 'JsonRpc';
  service: StaticService | DynamicService;
  method: string;
  params: unknown[];
  fetchArgs?: FetchArgs;
}

export interface HttpQueryArgs extends FetchArgs {
  apiType: 'Http';
  service: StaticService;
}

export type KbQueryArgs = JsonRpcQueryArgs | HttpQueryArgs;

export const isDynamic = (
  service: DynamicService | StaticService
): service is DynamicService => {
  return (service as StaticService).url === undefined;
};

type JsonRpcError = {
  version: '1.1';
  id: number;
  error: {
    name: string;
    code: number;
    message: string;
  };
};

const isJsonRpcError = (obj: unknown): obj is JsonRpcError => {
  if (
    typeof obj === 'object' &&
    obj !== null &&
    ['version', 'error', 'id'].every((k) => k in obj)
  ) {
    const { version, error } = obj as { version: unknown; error: unknown };
    if (version !== '1.1') return false;
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

export type KBaseBaseQueryError =
  | FetchBaseQueryError
  | {
      status: 'JSONRPC_ERROR';
      data: JsonRpcError;
    };

// These helpers let us avoid circular dependencies when using an API endpoint within kbaseBaseQuery
const consumedServices: { serviceWizardApi?: typeof serviceWizardApi } = {};
export const setConsumedService = <T extends keyof typeof consumedServices>(
  k: T,
  v: typeof consumedServices[T]
) => {
  consumedServices[k] = v;
};
export const getConsumedService = <T extends keyof typeof consumedServices>(
  k: T
) => {
  if (!consumedServices[k]) {
    throw new Error(`Consumed service ${k} was not set prior to use.`);
  }
  return consumedServices[k] as NonNullable<typeof consumedServices[T]>;
};

const getServiceUrl = async (
  name: string,
  release: string,
  baseQueryAPI: BaseQueryApi
): Promise<
  { url: string; error?: never } | { url?: never; error: KBaseBaseQueryError }
> => {
  // get serviceWizardApi while avoiding circular imports
  // (as serviceWizardApi imports this file)
  const serviceStatusQuery =
    getConsumedService('serviceWizardApi').endpoints.serviceStatus;

  const wizardQueryArgs = {
    module_name: name,
    version: release,
  };

  // trigger query, subscribing until we grab the value
  const statusQuery = baseQueryAPI.dispatch(
    serviceStatusQuery.initiate(wizardQueryArgs, {
      subscribe: true,
      forceRefetch: 300, // refetch if its been over 5 minutes
    })
  );

  // wait until the query completes
  await statusQuery;

  // Get query result from the cache after the query has completed
  const state = baseQueryAPI.getState() as RootState;
  const wizardResult = serviceStatusQuery.select(wizardQueryArgs)(state);

  // Raise any errors from the above call to service_wizard
  if (wizardResult.isError) {
    return { error: wizardResult.error as KBaseBaseQueryError };
  }

  // Get URL from wizardResult, no error so assert as a string;
  const serviceUrl = wizardResult.data?.[0].url as string;

  // release the statusQuery sub
  statusQuery.unsubscribe();

  return { url: serviceUrl };
};

export const kbaseBaseQuery: (
  fetchBaseQueryArgs: FetchBaseQueryArgs
) => BaseQueryFn<KbQueryArgs, unknown, KBaseBaseQueryError> = (
  fetchBaseQueryArgs
) => {
  // Add auth logic to base query args
  const modifiedArgs: FetchBaseQueryArgs = {
    ...fetchBaseQueryArgs,
    prepareHeaders: async (headers, api) => {
      if (fetchBaseQueryArgs.prepareHeaders) {
        await fetchBaseQueryArgs.prepareHeaders(headers, api);
      }
      const token = (api.getState() as RootState).auth.token;

      // If we have a token set in state, let's assume that we should be passing it.
      if (token) {
        headers.set('authorization', `${token}`);
      }
      return headers;
    },
  };

  // generate base query
  const rawBaseQuery = fetchBaseQuery(modifiedArgs);

  // wrap base query to add error handling and return
  const kbQuery: BaseQueryFn<KbQueryArgs, unknown, KBaseBaseQueryError> =
    async (kbQueryArgs, baseQueryAPI, extraOptions) => {
      // If this is a Http query, call rawBaseQuery directly, after prepending the service url
      if (kbQueryArgs.apiType === 'Http') {
        const fetchArgs = {
          ...kbQueryArgs,
          url: new URL(
            [kbQueryArgs.service.url, kbQueryArgs.url].reduce<string>(
              (url, part) =>
                (url.endsWith('/') ? url : url + '/') +
                (part && part.startsWith('/') ? part.slice(1) : part),
              fetchBaseQueryArgs.baseUrl || ''
            )
          ).toString(),
        };
        return rawBaseQuery(fetchArgs, baseQueryAPI, extraOptions);
      }
      // Otherwise, this is a JSON-RPC query
      // If this is a dynamic query, call service_wizard and transform it into a static one
      if (isDynamic(kbQueryArgs.service)) {
        // call service wizard to get the URL
        const serviceUrl = await getServiceUrl(
          kbQueryArgs.service.name,
          kbQueryArgs.service.release,
          baseQueryAPI
        );
        if (serviceUrl.error) return { error: serviceUrl.error };
        // Now that we have a URL we can re-run the kbQuery as a static service
        return kbQuery(
          {
            ...kbQueryArgs,
            service: {
              ...kbQueryArgs.service,
              url: serviceUrl.url,
            },
          },
          baseQueryAPI,
          extraOptions
        );
      }

      // Generate JsonRpc request id
      const reqId = Math.random();

      // generate request body
      const fetchArgs = {
        url: new URL(
          kbQueryArgs.service.url,
          fetchBaseQueryArgs.baseUrl
        ).toString(),
        method: 'POST',
        body: {
          version: '1.1', // TODO: conditionally implement JsonRpc 2.0
          id: reqId,
          method: kbQueryArgs.method,
          params: kbQueryArgs.params,
        },
        ...kbQueryArgs.fetchArgs, // Allow overriding JsonRpc defaults
      };

      // make request
      const request = rawBaseQuery(fetchArgs, baseQueryAPI, extraOptions);
      const response = await request;

      // identify and better differentiate jsonRpc errors
      if (response.error && response.error.status === 500) {
        if (isJsonRpcError(response.error.data)) {
          if (response.error.data.id && response.error.data.id !== reqId) {
            return {
              error: {
                status: 'CUSTOM_ERROR',
                error: 'JsonRpcProtocolError',
                data: `Response ID "${response.error.data.id}" !== Request ID "${reqId}"`,
              },
            };
          }
          return {
            error: {
              status: 'JSONRPC_ERROR',
              data: response.error.data,
            },
          };
        }
      }

      // If another error has occurred preventing a response, return default rtk-query response.
      // This appropriately handles rtk-query internal errors
      if (!response.data) return request;

      // From here, assume we have a jsonRpc response
      const data = response.data as {
        version: string;
        result?: unknown;
        error?: unknown;
        id?: number;
      };

      // If the IDs don't match, fail
      // TODO: find out if this is the idiomatic way to do this
      if (data.id && data.id !== reqId) {
        return {
          error: {
            status: 'CUSTOM_ERROR',
            error: 'JsonRpcProtocolError',
            data: `Response ID "${data.id}" !== Request ID "${reqId}"`,
          },
        };
      }

      // All went well, return the JsonRpc result
      return { data: data.result };
    };
  return kbQuery;
};
