import { baseApi } from '../../common/api';
import { jsonRpcService } from '../../common/api/utils/serviceHelpers';

// Status method
// Note no params
export interface StatusResult {
  status: string;
  current_time: number;
  start_time: number;
}

export interface InfoResult {
  'service-description': {
    name: string;
    title: string;
    version: string;
  };
}

export interface IsLinkedParams {
  username: string;
}

export type IsLinkedResult = boolean;

export interface GetOwnerLinkParams {
  username: string;
}

export interface ORCIDAuthPublic {
  expires_in: number;
  name: string;
  orcid: string;
  scope: string;
}

export interface LinkRecordPublic {
  created_at: number;
  expires_at: number;
  retires_at: number;
  username: string;
  orcid_auth: ORCIDAuthPublic;
}

export type GetOwnerLinkResult = LinkRecordPublic;

// It is mostly a JSONRPC 2.0 service, although the oauth flow is rest-ish.
const orcidlinkService = jsonRpcService({
  url: '/services/orcidlink/api/v1',
  version: '2.0',
});

export const orcidlinkAPI = baseApi
  .enhanceEndpoints({ addTagTypes: ['ORCIDLink'] })
  .injectEndpoints({
    // because many apis have "status", some have "info", and there may be
    // other random clashes.
    overrideExisting: true,
    endpoints: ({ query }) => ({
      status: query<StatusResult, {}>({
        query: () => {
          return orcidlinkService({
            method: 'status',
          });
        },
      }),
      isLinked: query<IsLinkedResult, IsLinkedParams>({
        query: ({ username }) => {
          return orcidlinkService({
            method: 'is-linked',
            params: {
              username,
            },
          });
        },
      }),
      getOwnerLink: query<GetOwnerLinkResult, GetOwnerLinkParams>({
        query: ({ username }) => {
          return orcidlinkService({
            method: 'owner-link',
            params: {
              username,
            },
          });
        },
      }),
    }),
  });
