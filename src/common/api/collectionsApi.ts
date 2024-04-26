import { uriEncodeTemplateTag as encode } from '../utils/stringUtils';
import { baseApi } from './index';
import { httpService } from './utils/serviceHelpers';
import { store } from '../../app/store';
import { SchemaObject } from 'ajv';

const collectionsService = httpService({
  url: 'services/collections',
});

export type ProcessState = 'processing' | 'failed' | 'complete';
type UPA = string;
// Collections-specific item ID strings (not an UPA or Data Object)
type KBaseId = string;
type KBaseType = string;

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
  attribution: string;
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
  types: KBaseType[];
  set_types: KBaseType[];
  description: string;
  required_data_products: string;
  user_parameters: SchemaObject;
  collection_parameters: SchemaObject;
}

interface BaseMatch {
  match_id: string;
  matcher_id: string;
  collection_id: string;
  collection_ver: number;
  user_parameters: Record<string, unknown>;
  state: ProcessState;
}

interface IncompleteMatch extends BaseMatch {
  state: 'failed' | 'processing';
}

interface CompleteMatch extends BaseMatch {
  state: 'complete';
  upas: UPA[];
  matches: KBaseId[];
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
  selection_ids: KBaseId[];
  unmatched_ids: KBaseId[];
}

type Selection = IncompleteSelection | CompleteSelection;

export interface HeatMapCell {
  cell_id: string;
  col_id: HeatMapColumn['col_id'];
  val: number | boolean;
  meta?: Record<string, string>;
}

export interface HeatMapRow {
  match: boolean;
  sel: boolean;
  kbase_id: KBaseId;
  kbase_display_name: string;
  cells: HeatMapCell[];
  meta?: Record<string, string>;
}

interface HeatMapColumnCategory {
  category: string;
  columns: HeatMapColumn[];
}

export interface HeatMapColumn {
  col_id: string;
  description: string;
  name: string;
  type: 'float' | 'int' | 'bool' | 'count';
  [key: string]: string;
}

interface ClientError {
  error: {
    httpcode: number;
    httpstatus: string;
    time: string;
    message?: string;
    appcode?: number;
    apperror?: string;
    request_validation_detail?: {
      loc: (string | number)[];
      msg: string;
      type: string;
    }[];
  };
}

interface ServerError {
  error: {
    httpcode: number;
    httpstatus: string;
    time: string;
    message?: string;
  };
}

type CollectionsError = ClientError | ServerError;

const isCollectionsError = (data: unknown): data is CollectionsError => {
  const e = data as CollectionsError;
  if (typeof e !== 'object' || e === null) return false;
  if (typeof e.error !== 'object' || e.error === null) return false;
  const errorShape = {
    httpcode: 'number',
    httpstatus: 'string',
    time: 'string',
  } as Record<keyof CollectionsError['error'], string>;
  if (
    Object.entries(errorShape).some(
      ([key, type]) =>
        !(key in e.error) ||
        typeof e.error[key as keyof CollectionsError['error']] !== type
    )
  )
    return false;
  if ('message' in e.error && typeof e.error.message !== 'string') return false;
  return true;
};

export type ColumnMeta = {
  key: string;
  category?: string;
  description?: string;
  display_name?: string;
} & (
  | {
      type: 'date' | 'int' | 'float';
      filter_strategy: undefined;
      min_value: number;
      max_value: number;
      enum_values: undefined;
    }
  | {
      type: 'string';
      filter_strategy: 'fulltext' | 'prefix' | 'identity' | 'ngram';
      min_value: undefined;
      max_value: undefined;
      enum_values: undefined;
    }
  | {
      type: 'enum';
      filter_strategy: undefined;
      min_value: undefined;
      max_value: undefined;
      enum_values: string[];
    }
);

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
  getSelectionTypes: {
    types: KBaseType[];
  };
  exportSelection: {
    set: {
      upa: UPA;
      type: KBaseType;
    };
  };
  listTaxaCountRanks: { data: string[] };
  getTaxaCountRank: {
    data: {
      name: string;
      count: number;
      match_count?: number;
      sel_count?: number;
    }[];
    match_state: ProcessState;
    selection_state: ProcessState;
  };
  getGenomeAttribs: {
    skip: number;
    limit: number;
    fields: { name: string }[];
    table: unknown[][];
    data?: null;
    count?: number;
  };
  getAttribHistogram: {
    bins: number[];
    values: number[];
  };
  getAttribScatter: {
    xcolumn: string;
    ycolumn: string;
    data: { x: number; y: number }[];
  };
  getGenomeAttribsMeta: {
    count: number;
    columns: Array<ColumnMeta>;
  };
  getMicroTrait: {
    description: string;
    match_state: ProcessState;
    selection_state: ProcessState;
    data: HeatMapRow[];
    min_value: number;
    max_value: number;
    count: number;
  };
  getMicroTraitMeta: {
    categories: HeatMapColumnCategory[];
    min_value: number;
    max_value: number;
  };
  getMicroTraitCell: {
    cell_id: string;
    values: { id: string; val: number | boolean }[];
  };
  getMicroTraitMissing: {
    match_state: ProcessState;
    selection_state: ProcessState;
    match_missing: KBaseId[];
    selection_missing: KBaseId[];
  };
  getBiolog: {
    description: string;
    match_state: ProcessState;
    selection_state: ProcessState;
    data: HeatMapRow[];
    min_value: number;
    max_value: number;
    count: number;
  };
  getBiologMeta: {
    categories: HeatMapColumnCategory[];
    min_value: number;
    max_value: number;
  };
  getBiologCell: {
    cell_id: string;
    values: { id: string; val: number | boolean }[];
  };
  getBiologMissing: {
    match_state: ProcessState;
    selection_state: ProcessState;
    match_missing: KBaseId[];
    selection_missing: KBaseId[];
  };
  getSampleAttribs: {
    skip: number;
    limit: number;
    fields: { name: string }[];
    table: unknown[][];
    data?: null;
    count?: number;
    selection_state: ProcessState;
    match_state: ProcessState;
  };
  getSampleAttribsMeta: {
    count: number;
    columns: Array<ColumnMeta>;
  };
  getSampleLocations: {
    match_state: ProcessState;
    selection_state: ProcessState;
    locs: {
      lat: number;
      lon: number;
      count: number;
      ids: string[];
    }[];
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
    upas: UPA[];
    parameters: Match['user_parameters'];
  };
  getMatch: Match['match_id'];
  createSelection: {
    collection_id: Collection['id'];
    selection_ids: Selection['selection_id'][];
  };
  getSelection: {
    selection_id: Selection['selection_id'];
  };
  getSelectionTypes: {
    selection_id: Selection['selection_id'];
  };
  exportSelection: {
    selection_id: Selection['selection_id'];
    workspace_id: string;
    object_name: string;
    ws_type: KBaseType;
    description: string;
    match_id?: Match['match_id'];
  };
  listTaxaCountRanks: {
    collection_id: Collection['id'];
    load_ver_override?: Collection['ver_tag'];
  };
  getTaxaCountRank: {
    collection_id: Collection['id'];
    rank: string;
    load_ver_override?: Collection['ver_tag'];
    match_id?: Match['match_id'];
    selection_id?: Selection['selection_id'];
    sort_priority?: string;
  };
  getGenomeAttribs: {
    collection_id: Collection['id'];
    sort_on?: string;
    sort_desc?: boolean;
    skip?: number;
    limit?: number;
    output_table?: true; // will only this query style for now, for clearer types
    match_id?: Match['match_id'];
    match_mark?: boolean;
    selection_id?: Selection['selection_id'];
    selection_mark?: boolean;
    count?: boolean;
    load_ver_override?: Collection['ver_tag'];
    filters?: Record<string, string>;
  };
  getGenomeAttribsMeta: {
    collection_id: Collection['id'];
    load_ver_override?: Collection['ver_tag'];
  };
  getAttribHistogram: {
    collection_id: Collection['id'];
    column: string;
    match_id?: Match['match_id'];
    selection_id?: Selection['selection_id'];
    load_ver_override?: Collection['ver_tag'];
    filters?: Record<string, string>;
  };
  getAttribScatter: {
    collection_id: Collection['id'];
    xcolumn: string;
    ycolumn: string;
    match_id?: Match['match_id'];
    selection_id?: Selection['selection_id'];
    load_ver_override?: Collection['ver_tag'];
    filters?: Record<string, string>;
  };
  getMicroTrait: {
    collection_id: Collection['id'];
    start_after?: KBaseId;
    limit?: number;
    count?: boolean;
    match_id?: Match['match_id'];
    match_mark?: boolean;
    selection_id?: Selection['selection_id'];
    selection_mark?: boolean;
    status_only?: boolean;
    load_ver_override?: Collection['ver_tag'];
  };
  getMicroTraitMeta: {
    collection_id: Collection['id'];
    load_ver_override?: Collection['ver_tag'];
  };
  getMicroTraitCell: {
    collection_id: Collection['id'];
    cell_id: HeatMapCell['cell_id'];
    load_ver_override?: Collection['ver_tag'];
  };
  getMicroTraitMissing: {
    collection_id: Collection['id'];
    match_id?: Match['match_id'];
    selection_id?: Selection['selection_id'];
  };
  getBiolog: {
    collection_id: Collection['id'];
    start_after?: KBaseId;
    limit?: number;
    count?: boolean;
    match_id?: Match['match_id'];
    match_mark?: boolean;
    selection_id?: Selection['selection_id'];
    selection_mark?: boolean;
    status_only?: boolean;
    load_ver_override?: Collection['ver_tag'];
  };
  getBiologMeta: {
    collection_id: Collection['id'];
    load_ver_override?: Collection['ver_tag'];
  };
  getBiologCell: {
    collection_id: Collection['id'];
    cell_id: HeatMapCell['cell_id'];
    load_ver_override?: Collection['ver_tag'];
  };
  getBiologMissing: {
    collection_id: Collection['id'];
    match_id?: Match['match_id'];
    selection_id?: Selection['selection_id'];
  };
  getSampleAttribs: {
    collection_id: Collection['id'];
    sort_on?: string;
    sort_desc?: boolean;
    skip?: number;
    limit?: number;
    output_table?: true; // will only this query style for now, for clearer types
    match_id?: Match['match_id'];
    match_mark?: boolean;
    selection_id?: Selection['selection_id'];
    selection_mark?: boolean;
    count?: boolean;
    load_ver_override?: Collection['ver_tag'];
  };
  getSampleAttribsMeta: {
    collection_id: Collection['id'];
    load_ver_override?: Collection['ver_tag'];
  };
  getSampleLocations: {
    collection_id: Collection['id'];
    include_sample_ids?: boolean;
    match_id?: Match['match_id'];
    selection_id?: Selection['selection_id'];
    status_only?: boolean;
    load_ver_override?: Collection['ver_tag'];
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

    getSelectionTypes: builder.query<
      CollectionsResults['getSelectionTypes'],
      CollectionsParams['getSelectionTypes']
    >({
      query: ({ selection_id }) =>
        collectionsService({
          method: 'GET',
          url: encode`/selections/${selection_id}/types`,
          params: {
            verbose: true,
          },
          headers: {
            authorization: `Bearer ${store.getState().auth.token}`,
          },
        }),
    }),

    exportSelection: builder.mutation<
      CollectionsResults['exportSelection'],
      CollectionsParams['exportSelection']
    >({
      query: ({
        selection_id,
        workspace_id,
        object_name,
        ws_type,
        description,
      }) =>
        collectionsService({
          method: 'POST',
          url: encode`/selections/${selection_id}/toset/${workspace_id}/obj/${object_name}/type/${ws_type}`,
          body: { description },
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
        sort_priority,
      }) =>
        collectionsService({
          method: 'GET',
          url: encode`/collections/${collection_id}/data_products/taxa_count/counts/${rank}/`,
          params: { load_ver_override, match_id, selection_id, sort_priority },
          headers: {
            authorization: `Bearer ${store.getState().auth.token}`,
          },
        }),
    }),

    getGenomeAttribs: builder.query<
      CollectionsResults['getGenomeAttribs'],
      CollectionsParams['getGenomeAttribs']
    >({
      query: ({ collection_id, filters, ...options }) =>
        collectionsService({
          method: 'GET',
          url: encode`/collections/${collection_id}/data_products/genome_attribs/`,
          params: { ...options, ...(filters ?? {}) },
          headers: {
            authorization: `Bearer ${store.getState().auth.token}`,
          },
        }),
    }),

    getGenomeAttribsMeta: builder.query<
      CollectionsResults['getGenomeAttribsMeta'],
      CollectionsParams['getGenomeAttribsMeta']
    >({
      query: ({ collection_id, ...options }) =>
        collectionsService({
          method: 'GET',
          url: encode`/collections/${collection_id}/data_products/genome_attribs/meta`,
          params: { collection_id, ...options },
          headers: {
            authorization: `Bearer ${store.getState().auth.token}`,
          },
        }),
    }),

    getAttribHistogram: builder.query<
      CollectionsResults['getAttribHistogram'],
      CollectionsParams['getAttribHistogram']
    >({
      query: ({ collection_id, ...options }) =>
        collectionsService({
          method: 'GET',
          url: encode`/collections/${collection_id}/data_products/genome_attribs/hist`,
          params: options,
          headers: {
            authorization: `Bearer ${store.getState().auth.token}`,
          },
        }),
    }),

    getAttribScatter: builder.query<
      CollectionsResults['getAttribScatter'],
      CollectionsParams['getAttribScatter']
    >({
      query: ({ collection_id, ...options }) =>
        collectionsService({
          method: 'GET',
          url: encode`/collections/${collection_id}/data_products/genome_attribs/scatter`,
          params: options,
          headers: {
            authorization: `Bearer ${store.getState().auth.token}`,
          },
        }),
    }),

    getMicroTrait: builder.query<
      CollectionsResults['getMicroTrait'],
      CollectionsParams['getMicroTrait']
    >({
      query: ({ collection_id, ...options }) =>
        collectionsService({
          method: 'GET',
          url: encode`/collections/${collection_id}/data_products/microtrait/`,
          params: options,
          headers: {
            authorization: `Bearer ${store.getState().auth.token}`,
          },
        }),
    }),

    getMicroTraitMeta: builder.query<
      CollectionsResults['getMicroTraitMeta'],
      CollectionsParams['getMicroTraitMeta']
    >({
      query: ({ collection_id, ...options }) =>
        collectionsService({
          method: 'GET',
          url: encode`/collections/${collection_id}/data_products/microtrait/meta`,
          params: options,
          headers: {
            authorization: `Bearer ${store.getState().auth.token}`,
          },
        }),
    }),

    getMicroTraitCell: builder.query<
      CollectionsResults['getMicroTraitCell'],
      CollectionsParams['getMicroTraitCell']
    >({
      query: ({ collection_id, cell_id, ...options }) =>
        collectionsService({
          method: 'GET',
          url: encode`/collections/${collection_id}/data_products/microtrait/cell/${cell_id}`,
          params: options,
          headers: {
            authorization: `Bearer ${store.getState().auth.token}`,
          },
        }),
    }),

    getMicroTraitMissing: builder.query<
      CollectionsResults['getMicroTraitMissing'],
      CollectionsParams['getMicroTraitMissing']
    >({
      query: ({ collection_id, ...options }) =>
        collectionsService({
          method: 'GET',
          url: encode`/collections/${collection_id}/data_products/microtrait/missing`,
          params: options,
          headers: {
            authorization: `Bearer ${store.getState().auth.token}`,
          },
        }),
    }),

    getBiolog: builder.query<
      CollectionsResults['getBiolog'],
      CollectionsParams['getBiolog']
    >({
      query: ({ collection_id, ...options }) =>
        collectionsService({
          method: 'GET',
          url: encode`/collections/${collection_id}/data_products/biolog/`,
          params: options,
          headers: {
            authorization: `Bearer ${store.getState().auth.token}`,
          },
        }),
    }),

    getBiologMeta: builder.query<
      CollectionsResults['getBiologMeta'],
      CollectionsParams['getBiologMeta']
    >({
      query: ({ collection_id, ...options }) =>
        collectionsService({
          method: 'GET',
          url: encode`/collections/${collection_id}/data_products/biolog/meta`,
          params: options,
          headers: {
            authorization: `Bearer ${store.getState().auth.token}`,
          },
        }),
    }),

    getBiologCell: builder.query<
      CollectionsResults['getBiologCell'],
      CollectionsParams['getBiologCell']
    >({
      query: ({ collection_id, cell_id, ...options }) =>
        collectionsService({
          method: 'GET',
          url: encode`/collections/${collection_id}/data_products/biolog/cell/${cell_id}`,
          params: options,
          headers: {
            authorization: `Bearer ${store.getState().auth.token}`,
          },
        }),
    }),

    getBiologMissing: builder.query<
      CollectionsResults['getBiologMissing'],
      CollectionsParams['getBiologMissing']
    >({
      query: ({ collection_id, ...options }) =>
        collectionsService({
          method: 'GET',
          url: encode`/collections/${collection_id}/data_products/biolog/missing`,
          params: options,
          headers: {
            authorization: `Bearer ${store.getState().auth.token}`,
          },
        }),
    }),

    getSampleAttribs: builder.query<
      CollectionsResults['getSampleAttribs'],
      CollectionsParams['getSampleAttribs']
    >({
      query: ({ collection_id, ...options }) =>
        collectionsService({
          method: 'GET',
          url: encode`/collections/${collection_id}/data_products/samples/`,
          params: options,
          headers: {
            authorization: `Bearer ${store.getState().auth.token}`,
          },
        }),
    }),

    getSampleAttribsMeta: builder.query<
      CollectionsResults['getSampleAttribsMeta'],
      CollectionsParams['getSampleAttribsMeta']
    >({
      query: ({ collection_id, ...options }) =>
        collectionsService({
          method: 'GET',
          url: encode`/collections/${collection_id}/data_products/samples/meta`,
          params: { collection_id, ...options },
          headers: {
            authorization: `Bearer ${store.getState().auth.token}`,
          },
        }),
    }),

    getSampleLocations: builder.query<
      CollectionsResults['getSampleLocations'],
      CollectionsParams['getSampleLocations']
    >({
      query: ({ collection_id, ...options }) =>
        collectionsService({
          method: 'GET',
          url: encode`/collections/${collection_id}/data_products/samples/locations`,
          params: options,
          headers: {
            authorization: `Bearer ${store.getState().auth.token}`,
          },
        }),
    }),
  }),
});

export type CollectionsReturnType =
  typeof collectionsApi['endpoints'][keyof typeof collectionsApi['endpoints']]['initiate'];

export const parseCollectionsError = (
  /**result.error object from any collections query.
   * The type definition is unfortunately a bit visually hairy.
   * But all the typedef is doing is extracting the error type.*/
  error:
    | Extract<
        Awaited<ReturnType<ReturnType<CollectionsReturnType>>>,
        { error: unknown }
      >['error']
    | undefined
) => {
  if (!error) return undefined;
  if ('data' in error) {
    if (isCollectionsError(error.data)) {
      return error.data as CollectionsError;
    }
  }
  return undefined;
};

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
  getSelectionTypes,
  exportSelection,
  listTaxaCountRanks,
  getTaxaCountRank,
  getGenomeAttribs,
  getAttribHistogram,
  getAttribScatter,
  getGenomeAttribsMeta,
  getMicroTrait,
  getMicroTraitMeta,
  getMicroTraitCell,
  getMicroTraitMissing,
  getBiolog,
  getBiologMeta,
  getBiologCell,
  getBiologMissing,
  getSampleAttribs,
  getSampleAttribsMeta,
  getSampleLocations,
} = collectionsApi.endpoints;
