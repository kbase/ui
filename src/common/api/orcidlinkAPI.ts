import { baseApi } from '.';
import { LinkRecordPublic, ORCIDProfile } from './orcidLinkCommon';
import { jsonRpc2Service } from './utils/serviceHelpers';

// system info

export interface ServiceDescription {
  name: string;
  title: string;
  version: string;
  language: string;
  description: string;
  repoURL: string;
}

export interface GitInfo {
  commit_hash: string;
  commit_hash_abbreviated: string;
  author_name: string;
  committer_name: string;
  committer_date: number;
  url: string;
  branch: string;
  tag: string | null;
}

export interface RuntimeInfo {
  current_time: number;
  orcid_api_url: string;
  orcid_oauth_url: string;
  orcid_site_url: string;
}

// TODO: normalize to either kebab or underscore. Pref underscore.
export interface InfoResult {
  'service-description': ServiceDescription;
  'git-info': GitInfo;
  runtime_info: RuntimeInfo;
}

// combined api calls for initial view

export interface ORCIDLinkInitialStateResult {
  isLinked: boolean;
  info: InfoResult;
}

export interface ORCIDLinkInitialStateParams {
  username: string;
}

// combined api call for linked user info

export interface ORCIDLinkLinkedUserInfoResult {
  linkRecord: LinkRecordPublic;
  profile: ORCIDProfile;
}

export interface ORCIDLinkLinkedUserInfoParams {
  username: string;
}

// It is mostly a JSONRPC 2.0 service, although the oauth flow is rest-ish.
const orcidlinkService = jsonRpc2Service({
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
      orcidlinkInitialState: query<
        ORCIDLinkInitialStateResult,
        ORCIDLinkInitialStateParams
      >({
        async queryFn({ username }, _queryApi, _extraOptions, fetchWithBQ) {
          const [isLinked, info] = await Promise.all([
            fetchWithBQ(
              orcidlinkService({
                method: 'is-linked',
                params: {
                  username,
                },
              })
            ),
            fetchWithBQ(
              orcidlinkService({
                method: 'info',
              })
            ),
          ]);
          if (isLinked.error) {
            return { error: isLinked.error };
          }
          if (info.error) {
            return { error: info.error };
          }
          return {
            data: {
              isLinked: isLinked.data as boolean,
              info: info.data as InfoResult,
            },
          };
        },
      }),
      orcidlinkLinkedUserInfo: query<
        ORCIDLinkLinkedUserInfoResult,
        ORCIDLinkLinkedUserInfoParams
      >({
        async queryFn({ username }, _queryApi, _extraOptions, fetchWithBQ) {
          const profileQuery = orcidlinkService({
            method: 'get-orcid-profile',
            params: {
              username,
            },
          });

          const [linkRecord, profile] = await Promise.all([
            fetchWithBQ(
              orcidlinkService({
                method: 'owner-link',
                params: {
                  username,
                },
              })
            ),
            fetchWithBQ(profileQuery),
          ]);
          if (linkRecord.error) {
            return { error: linkRecord.error };
          }

          if (profile.error) {
            return { error: profile.error };
          }
          return {
            data: {
              linkRecord: linkRecord.data as LinkRecordPublic,
              profile: profile.data as ORCIDProfile,
            },
          };
        },
      }),
    }),
  });
