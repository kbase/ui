import { baseApi } from './index';
import { jsonRpcService } from './utils/serviceHelpers';

export const narrativeMethodStore = jsonRpcService({
  url: '/services/narrative_method_store/rpc',
});

interface NarrativeMethodStoreParams {
  status: void;
  getMethodBriefInfo: {
    ids: readonly string[];
    tag: 'release' | 'dev' | 'beta';
  }[];
}

interface NarrativeMethodStoreResults {
  status: unknown;
  getMethodBriefInfo: {
    id: string;
    module_name: string;
    git_commit_hash: string;
    name: string;
    ver: string;
    subtitle: string;
    tooltip: string;
    icon: { url: string };
    categories: string[];
    loading_error: string;
    authors: string[];
    input_types: string[];
    output_types: string[];
    app_type: string;
  }[];
}

const narrativeMethodStoreApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    narrativeMethodStoreStatus: builder.query<
      NarrativeMethodStoreResults['status'],
      NarrativeMethodStoreParams['status']
    >({
      query: () =>
        narrativeMethodStore({
          method: 'NarrativeMethodStore.status',
          params: [],
        }),
    }),
    getMethodBriefInfo: builder.query<
      NarrativeMethodStoreResults['getMethodBriefInfo'],
      NarrativeMethodStoreParams['getMethodBriefInfo']
    >({
      query: (params) =>
        narrativeMethodStore({
          method: 'NarrativeMethodStore.get_method_brief_info',
          params: params,
        }),
    }),
  }),
});

export const { narrativeMethodStoreStatus, getMethodBriefInfo } =
  narrativeMethodStoreApi.endpoints;
