import { uriEncodeTemplateTag as encode } from '../utils/stringUtils';
import { baseApi } from './index';
import { httpService } from './utils/serviceHelpers';
import { store } from '../../app/store';

const collectionsService = httpService({
  url: 'services/collections',
});

type ProcessState = 'processing' | 'failed' | 'complete';

export interface DataProduct {
  product: string;
  version: string;
}

interface DataProductRef {
  product: string;
  version: string;
}

export interface UnsavedCollection {
  id: string;
  name: string;
  desc: string;
  ver_tag: string;
  ver_src: string;
  icon_url: string;
  data_products: DataProductRef[];
}

export interface Collection extends UnsavedCollection {
  ver_num: number;
  user_create: string;
  date_create: string;
  user_active: string;
  date_active: string;
}

interface Matcher {
  id: string;
  types: string[];
  set_types: string[];
  description: string;
  required_data_products: string;
  user_parameters: unknown;
  collection_parameters: unknown;
}

interface BaseMatch {
  match_id: string;
  matcher_id: string;
  collection_id: string;
  collection_ver: number;
  user_parameters: Record<string, never>;
  state: ProcessState;
}

interface IncompleteMatch extends BaseMatch {
  state: 'failed' | 'processing';
}

interface CompleteMatch extends BaseMatch {
  state: 'complete';
  upas: string[];
  matches: string[];
}

type Match = IncompleteMatch | CompleteMatch;

interface BaseSelection {
  state: ProcessState;
  collection_id: Collection['id'];
  collection_ver: Collection['ver_num'];
  selection_id: string;
}

interface IncompleteSelection extends BaseSelection {
  state: 'failed' | 'processing';
}

interface CompleteSelection extends BaseSelection {
  state: 'complete';
  selection_ids: string[];
  unmatched_ids: string[];
}

type Selection = IncompleteSelection | CompleteSelection;

interface CollectionsResults {
  status: {
    service_name: string;
    version: string;
    git_hash: string;
    server_time: string;
  };
  listCollections: { data: Collection[] };
  getCollection: Collection;
  saveCollection: Collection;
  activateVersion: void;
  getCollectionMatchers: { data: Matcher[] };
  createMatch: Match;
  getMatch: Match;
  createSelection: BaseSelection;
  getSelection: Selection;
  listTaxaCountRanks: { data: string[] };
  getTaxaCountRank: {
    data: {
      name: string;
      count: number;
      match_count?: number;
      sel_count?: number;
    }[];
    taxa_count_match_state: ProcessState;
    taxa_count_selection_state: ProcessState;
  };
  getGenomeAttribs: {
    skip: number;
    limit: number;
    fields: { name: string }[];
    table: unknown[][];
    data?: null;
    count?: number;
  };
}

interface CollectionsParams {
  status: void;
  listCollections: void;
  getCollection: Collection['id'];
  saveCollection: UnsavedCollection;
  activateVersion:
    | Pick<Collection, 'id' | 'ver_tag'>
    | Pick<Collection, 'id' | 'ver_num'>;
  getCollectionMatchers: Collection['id'];
  createMatch: {
    collection_id: Collection['id'];
    matcher_id: Matcher['id'];
    upas: string[];
    parameters: Match['user_parameters'];
  };
  getMatch: string;
  createSelection: {
    collection_id: Collection['id'];
    selection_ids: string[];
  };
  getSelection: {
    selection_id: string;
  };
  listTaxaCountRanks: { collection_id: string; load_ver_override?: string };
  getTaxaCountRank: {
    collection_id: string;
    rank: string;
    load_ver_override?: string;
    match_id?: string;
    selection_id?: string;
  };
  getGenomeAttribs: {
    collection_id: string;
    sort_on?: string;
    sort_desc?: boolean;
    skip?: number;
    limit?: number;
    output_table?: true; // will only this query style for now, for clearer types
    match_id?: string;
    match_mark?: boolean;
    selection_id?: string;
    selection_mark?: boolean;
    count?: boolean;
    load_ver_override?: string;
  };
}

// Auth does not use JSONRpc, so we use queryFn to make custom queries
export const collectionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    collectionsStatus: builder.query<
      CollectionsResults['status'],
      CollectionsParams['status']
    >({
      query: () => collectionsService({ method: 'GET', url: `/` }),
    }),

    listCollections: builder.query<
      CollectionsResults['listCollections'],
      CollectionsParams['listCollections']
    >({
      query: () => collectionsService({ method: 'GET', url: `/collections/` }),
    }),

    getCollection: builder.query<
      CollectionsResults['getCollection'],
      CollectionsParams['getCollection']
    >({
      query: (id) =>
        collectionsService({ method: 'GET', url: encode`/collections/${id}/` }),
    }),

    saveCollection: builder.mutation<
      CollectionsResults['saveCollection'],
      CollectionsParams['saveCollection']
    >({
      query: ({ id, ver_tag, ...collection }) =>
        collectionsService({
          method: 'PUT',
          url: encode`/collections/${id}/versions/${ver_tag}/`,
        }),
    }),

    activateVersion: builder.mutation<
      CollectionsResults['activateVersion'],
      CollectionsParams['activateVersion']
    >({
      query: ({ id, ...either_ver }) =>
        collectionsService({
          method: 'PUT',
          url:
            'ver_num' in either_ver
              ? encode`/collections/${id}/versions/num/${either_ver.ver_num}/activate/`
              : encode`/collections/${id}/versions/tag/${either_ver.ver_tag}/activate/`,
        }),
    }),

    getCollectionMatchers: builder.query<
      CollectionsResults['getCollectionMatchers'],
      CollectionsParams['getCollectionMatchers']
    >({
      query: (id) =>
        collectionsService({
          method: 'GET',
          url: encode`/collections/${id}/matchers`,
        }),
    }),

    createMatch: builder.mutation<
      CollectionsResults['createMatch'],
      CollectionsParams['createMatch']
    >({
      query: (params) => {
        const { collection_id, matcher_id, ...body_params } = params;
        return collectionsService({
          method: 'POST',
          url: encode`/collections/${collection_id}/matchers/${matcher_id}`,
          body: body_params,
          headers: {
            authorization: `Bearer ${store.getState().auth.token}`,
          },
        });
      },
    }),

    getMatch: builder.query<
      CollectionsResults['getMatch'],
      CollectionsParams['getMatch']
    >({
      query: (match_id) =>
        collectionsService({
          method: 'GET',
          url: encode`/matches/${match_id}/`,
          params: {
            verbose: true,
          },
          headers: {
            authorization: `Bearer ${store.getState().auth.token}`,
          },
        }),
    }),

    createSelection: builder.mutation<
      CollectionsResults['createSelection'],
      CollectionsParams['createSelection']
    >({
      query: ({ collection_id, selection_ids }) =>
        collectionsService({
          method: 'POST',
          url: encode`/collections/${collection_id}/selections`,
          params: {
            verbose: true,
          },
          headers: {
            authorization: `Bearer ${store.getState().auth.token}`,
          },
          body: {
            selection_ids,
          },
        }),
    }),

    getSelection: builder.query<
      CollectionsResults['getSelection'],
      CollectionsParams['getSelection']
    >({
      query: ({ selection_id }) =>
        collectionsService({
          method: 'GET',
          url: encode`/selections/${selection_id}`,
          params: {
            verbose: true,
          },
          headers: {
            authorization: `Bearer ${store.getState().auth.token}`,
          },
        }),
    }),

    listTaxaCountRanks: builder.query<
      CollectionsResults['listTaxaCountRanks'],
      CollectionsParams['listTaxaCountRanks']
    >({
      query: ({ collection_id, load_ver_override }) =>
        collectionsService({
          method: 'GET',
          url: encode`/collections/${collection_id}/data_products/taxa_count/ranks/`,
          params: load_ver_override ? { load_ver_override } : undefined,
          headers: {
            authorization: `Bearer ${store.getState().auth.token}`,
          },
        }),
    }),

    getTaxaCountRank: builder.query<
      CollectionsResults['getTaxaCountRank'],
      CollectionsParams['getTaxaCountRank']
    >({
      query: ({
        collection_id,
        rank,
        load_ver_override,
        match_id,
        selection_id,
      }) =>
        collectionsService({
          method: 'GET',
          url: encode`/collections/${collection_id}/data_products/taxa_count/counts/${rank}/`,
          params: { load_ver_override, match_id, selection_id },
          headers: {
            authorization: `Bearer ${store.getState().auth.token}`,
          },
        }),
    }),

    getGenomeAttribs: builder.query<
      CollectionsResults['getGenomeAttribs'],
      CollectionsParams['getGenomeAttribs']
    >({
      query: ({ collection_id, ...options }) =>
        collectionsService({
          method: 'GET',
          url: encode`/collections/${collection_id}/data_products/genome_attribs/`,
          params: options,
          headers: {
            authorization: `Bearer ${store.getState().auth.token}`,
          },
        }),
    }),
  }),
});

export const {
  collectionsStatus: status,
  listCollections,
  getCollection,
  saveCollection,
  activateVersion,
  getCollectionMatchers,
  createMatch,
  getMatch,
  createSelection,
  getSelection,
  listTaxaCountRanks,
  getTaxaCountRank,
  getGenomeAttribs,
} = collectionsApi.endpoints;
