/* orgsApi.ts */
import { uriEncodeTemplateTag as encode } from '../utils/stringUtils';
import { httpService } from './utils/serviceHelpers';
import { baseApi } from './index';

const orgsService = httpService({
  url: '/services/groups/',
});

export interface OrgInfo {
  id: string;
  owner: string; // user id
  name: string;
  role: string;
  private: boolean;
}

export interface OrgMemberInfo {
  id: string;
  name: string;
}

export interface OrgsParams {
  getNarrativeOrgs: number;
  getUserOrgs: void;
  linkNarrative: { orgId: string; wsId: number };
}

export interface OrgsResults {
  getNarrativeOrgs: OrgInfo[];
  getUserOrgs: OrgMemberInfo[];
  linkNarrative: unknown;
}

export const orgsApi = baseApi
  .enhanceEndpoints({ addTagTypes: ['Orgs'] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getNarrativeOrgs: builder.query<
        OrgInfo[],
        OrgsParams['getNarrativeOrgs']
      >({
        query: (id) =>
          orgsService({
            method: 'GET',
            url: encode`/group?resourcetype=workspace&resource=${id}`,
          }),
        providesTags: ['Orgs'],
      }),
      getUserOrgs: builder.query<
        OrgsResults['getUserOrgs'],
        OrgsParams['getUserOrgs']
      >({
        query: () =>
          orgsService({
            method: 'GET',
            url: '/member',
          }),
        providesTags: ['Orgs'],
      }),
      linkNarrative: builder.mutation<
        OrgsResults['linkNarrative'],
        OrgsParams['linkNarrative']
      >({
        query: ({ orgId, wsId }) =>
          orgsService({
            method: 'POST',
            url: `group/${orgId}/resource/workspace/${wsId}`,
          }),
      }),
    }),
  });

export const { getNarrativeOrgs, getUserOrgs, linkNarrative } =
  orgsApi.endpoints;
export const clearCacheAction = orgsApi.util.invalidateTags(['Orgs']);
