import { baseApi } from './index';
import { jsonRpcService } from './utils/serviceHelpers';
import { NarrativeListDoc } from '../types/NarrativeDoc';

const searchService = jsonRpcService({
  url: '/services/searchapi2/rpc',
});

interface SearchGetNarrativesParams {
  access: {
    only_public: boolean;
  };
  filters: {
    operator: 'AND';
    fields: {
      field: string;
      term?: string | boolean;
      not_term?: string;
    }[];
  };
  paging: {
    length: number;
    offset: number;
  };
  search: {
    query: string;
    fields: ['agg_fields'];
  };
  sorts: string[][];
  types: ['KBaseNarrative.Narrative'];
}

interface SearchGetNarrativesResults {
  count: number;
  hits: NarrativeListDoc[];
  search_time: number;
}

export interface SearchParams {
  getNarratives: SearchGetNarrativesParams;
}

export interface SearchResults {
  getNarratives: SearchGetNarrativesResults;
}

export const searchApi = baseApi
  .enhanceEndpoints({ addTagTypes: ['Search'] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getSearch: builder.query<
        SearchResults['getNarratives'],
        SearchParams['getNarratives']
      >({
        query: (params: SearchGetNarrativesParams) =>
          searchService({
            method: 'search_workspace',
            params,
          }),
        providesTags: ['Search'],
      }),
    }),
  });

export const { getSearch } = searchApi.endpoints;
export const clearCacheAction = searchApi.util.invalidateTags(['Search']);
