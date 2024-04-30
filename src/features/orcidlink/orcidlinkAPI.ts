import { baseApi } from '../../common/api';
import { jsonRpcService } from '../../common/api/utils/serviceHelpers';

// orcidlink system types

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

// Method types

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

// is-linked

export interface IsLinkedParams {
  username: string;
}

export type IsLinkedResult = boolean;

// owner-link
export interface OwnerLinkParams {
  username: string;
}

export type OwnerLinkResult = LinkRecordPublic;

// It is mostly a JSONRPC 2.0 service, although the oauth flow is rest-ish.
const orcidlinkService = jsonRpcService({
  url: '/services/orcidlink/api/v1',
  version: '2.0',
});

/**
 * orcidlink service api
 */
export const orcidlinkAPI = baseApi
  .enhanceEndpoints({ addTagTypes: ['ORCIDLink'] })
  .injectEndpoints({
    endpoints: ({ query }) => ({
      orcidlinkStatus: query<StatusResult, {}>({
        query: () => {
          return orcidlinkService({
            method: 'status',
          });
        },
      }),
      orcidlinkIsLinked: query<IsLinkedResult, IsLinkedParams>({
        query: ({ username }) => {
          return orcidlinkService({
            method: 'is-linked',
            params: {
              username,
            },
          });
        },
      }),
      orcidlinkOwnerLink: query<OwnerLinkResult, OwnerLinkParams>({
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
