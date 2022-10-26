import { baseApi } from './index';
import { jsonRpcService } from './utils/serviceHelpers';

const wsObject = jsonRpcService({
  url: '/services/ws',
});

interface wsObjectParams {
  getwsObjectByName: { upa: string };
}

interface wsObjectResults {
  getwsObjectByName: unknown;
}

const wsObjectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getwsObjectByName: builder.query<
      wsObjectResults['getwsObjectByName'],
      wsObjectParams['getwsObjectByName']
    >({
      query: ({ upa }) =>
        wsObject({
          method: 'Workspace.get_objects2',
          params: [{ objects: [{ ref: upa }] }],
        }),
    }),
  }),
});

export const { useGetwsObjectByNameQuery } = wsObjectApi;
