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
}

export interface OrgsResults {
  getNarrativeOrgs: OrgInfo[];
  getUserOrgs: OrgMemberInfo[];
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
    }),
  });

export const { getNarrativeOrgs, getUserOrgs } = orgsApi.endpoints;
export const clearCacheAction = orgsApi.util.invalidateTags(['Orgs']);
