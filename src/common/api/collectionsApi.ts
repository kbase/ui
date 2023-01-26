import { uriEncodeTemplateTag as encode } from '../utils/stringUtils';
import { baseApi } from './index';
import { httpService } from './utils/serviceHelpers';

const collectionsService = httpService({
  url: 'services/collectionsservice',
});

export interface DataProduct {
  product: string;
  version: string;
  // unknown
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
  listTaxaCountRanks: { data: string[] };
  getTaxaCountRank: {
    data: {
      name: string;
      count: number;
    }[];
  };
  getGenomeAttribs: {
    skip: number;
    limit: number;
    fields: { name: string }[];
    table: unknown[][];
    data?: null;
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
  listTaxaCountRanks: { collection_id: string; load_ver_override?: string };
  getTaxaCountRank: {
    collection_id: string;
    rank: string;
    load_ver_override?: string;
  };
  getGenomeAttribs: {
    collection_id: string;
    sort_on?: string;
    sort_desc?: boolean;
    skip?: number;
    limit?: number;
    output_table?: true; // will only this query style for now, for clearer types
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
      // queryFn: () => ({
      //   data: {
      //     data: [
      //       mockCollection(),
      //       mockCollection(),
      //       mockCollection(),
      //       mockCollection(),
      //       mockCollection(),
      //     ],
      //   },
      // }),
    }),

    getCollection: builder.query<
      CollectionsResults['getCollection'],
      CollectionsParams['getCollection']
    >({
      query: (id) =>
        collectionsService({ method: 'GET', url: encode`/collections/${id}/` }),
      // queryFn: (id) => ({ data: mockCollection({ id }) }),
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

    listTaxaCountRanks: builder.query<
      CollectionsResults['listTaxaCountRanks'],
      CollectionsParams['listTaxaCountRanks']
    >({
      query: ({ collection_id, load_ver_override }) =>
        collectionsService({
          method: 'GET',
          url: encode`/collections/${collection_id}/data_products/taxa_count/ranks/`,
          params: load_ver_override ? { load_ver_override } : undefined,
        }),
    }),

    getTaxaCountRank: builder.query<
      CollectionsResults['getTaxaCountRank'],
      CollectionsParams['getTaxaCountRank']
    >({
      query: ({ collection_id, rank, load_ver_override }) =>
        collectionsService({
          method: 'GET',
          url: encode`/collections/${collection_id}/data_products/taxa_count/counts/${rank}/`,
          params: load_ver_override ? { load_ver_override } : undefined,
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
  listTaxaCountRanks,
  getTaxaCountRank,
  getGenomeAttribs,
} = collectionsApi.endpoints;

// const mockCollection = (override?: Partial<Collection>): Collection => {
//   const randoNum = Math.floor(Math.random() * 1000000000);
//   const id = Number(override?.id) || randoNum;
//   return {
//     id: String(id),
//     name: `Some Collection with ID ${id}`,
//     desc: 'some collections description here',
//     ver_tag: `tag_${id}`,
//     ver_num: id,
//     ver_src: 'foo_bar_baz',
//     icon_url: `https://picsum.photos/seed/${id}/64`,
//     user_active: 'FooUser',
//     user_create: 'FooUser2',
//     date_create: new Date().toString(),
//     date_active: new Date().toString(),
//     data_products: [],
//     ...override,
//   };
// };
