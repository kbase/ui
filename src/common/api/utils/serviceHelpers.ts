import { JsonRpcQueryArgs, HttpQueryArgs } from './kbaseBaseQuery';

// Helpers for adding service info to each query,
export const jsonRpcService = (
  service: JsonRpcQueryArgs['service']
): ((
  queryArgs: Omit<JsonRpcQueryArgs, 'service' | 'apiType'>
) => JsonRpcQueryArgs) => {
  return (queryArgs) => ({
    apiType: 'JsonRpc',
    service: service,
    ...queryArgs,
  });
};

export const jsonRpc2Service = (
  service: JsonRpcQueryArgs['service']
): ((
  queryArgs: Omit<JsonRpcQueryArgs, 'service' | 'apiType'>
) => JsonRpcQueryArgs) => {
  return (queryArgs) => ({
    apiType: 'JsonRpc',
    service,
    ...queryArgs,
  });
};

export const httpService = (
  service: HttpQueryArgs['service']
): ((
  queryArgs: Omit<HttpQueryArgs, 'service' | 'apiType'>
) => HttpQueryArgs) => {
  return (queryArgs) => ({
    apiType: 'Http',
    service: service,
    ...queryArgs,
  });
};
