/* orgsApi.ts */
import { uriEncodeTemplateTag as encode } from '../utils/stringUtils';
import { httpService } from './utils/serviceHelpers';
import { baseApi } from './index';

const orgsService = httpService({
  url: '/services/groups/',
});

export type Role = 'None' | 'Member' | 'Admin' | 'Owner';

// Legacy interface for backwards compatibility
export interface OrgInfo {
  id: string;
  owner: string; // user id
  name: string;
  role: string;
  private: boolean;
}

export interface BriefOrganization {
  id: string;
  name: string;
  logoUrl: string | null;
  isPrivate: boolean;
  homeUrl: string | null;
  researchInterests: string | null;
  owner: {
    username: string;
    realname: string;
  };
  relation: Role;
  isMember: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  createdAt: string;
  modifiedAt: string;
  lastVisitedAt: string | null;
  memberCount: number;
  narrativeCount: number;
  appCount: number;
  relatedOrganizations: string[];
}

export interface Organization extends BriefOrganization {
  description: string;
  areMembersPrivate: boolean;
  members: Member[];
  narratives: NarrativeResource[];
  apps: AppResource[];
}

export interface Member {
  username: string;
  realname: string;
  joinedAt: string;
  lastVisitedAt: string | null;
  type: 'member' | 'admin' | 'owner';
  title: string | null;
  isVisible: boolean;
}

export interface NarrativeResource {
  workspaceId: number;
  title: string;
  permission: 'view' | 'edit' | 'admin' | 'owner';
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  addedAt: string | null;
  description: string;
  isVisible: boolean;
}

export interface AppResource {
  appId: string;
  addedAt: string | null;
  isVisible: boolean;
}

export interface OrganizationRequest {
  id: string;
  groupId: string;
  requester: string;
  type: string;
  status: string;
  resource: string;
  resourceType: string;
  createdAt: string;
  expiredAt: string;
  modifiedAt: string;
}

export interface Filter {
  roleType: 'myorgs' | 'all' | 'notmyorgs' | 'select';
  roles: string[];
  privacy: 'any' | 'public' | 'private';
}

export interface OrganizationQuery {
  searchTerms: string[];
  sortField: string;
  sortDirection: 'ascending' | 'descending';
  filter: Filter;
}

export interface CreateOrganizationInput {
  id: string;
  name: string;
  logoUrl?: string;
  homeUrl?: string;
  researchInterests?: string;
  description?: string;
  isPrivate: boolean;
}

export interface UpdateOrganizationInput {
  name: string;
  logoUrl?: string;
  homeUrl?: string;
  researchInterests?: string;
  description?: string;
  isPrivate: boolean;
}

export interface OrgsParams {
  listOrganizations: OrganizationQuery;
  getOrganization: string;
  createOrganization: CreateOrganizationInput;
  updateOrganization: { id: string; update: UpdateOrganizationInput };
  deleteOrganization: string;
  requestMembership: string;
  inviteUser: { orgId: string; username: string };
  updateMember: { orgId: string; username: string; update: { title?: string } };
  removeMember: { orgId: string; username: string };
  memberToAdmin: { orgId: string; username: string };
  adminToMember: { orgId: string; username: string };
  getNarrativeOrgs: number;
  getUserOrgs: void;
  linkNarrative: { orgId: string; wsId: number };
  unlinkNarrative: { orgId: string; wsId: number };
  addApp: { orgId: string; appId: string };
  removeApp: { orgId: string; appId: string };
  getRequests: string;
  acceptRequest: string;
  denyRequest: string;
  cancelRequest: string;
}

export interface OrgsResults {
  listOrganizations: { organizations: BriefOrganization[]; total: number };
  getOrganization: Organization;
  createOrganization: Organization;
  updateOrganization: void;
  deleteOrganization: void;
  requestMembership: OrganizationRequest;
  inviteUser: OrganizationRequest;
  updateMember: void;
  removeMember: void;
  memberToAdmin: void;
  adminToMember: void;
  getNarrativeOrgs: OrgInfo[];
  getUserOrgs: BriefOrganization[];
  linkNarrative: unknown;
  unlinkNarrative: void;
  addApp: unknown;
  removeApp: void;
  getRequests: OrganizationRequest[];
  acceptRequest: OrganizationRequest;
  denyRequest: OrganizationRequest;
  cancelRequest: OrganizationRequest;
}

export const orgsApi = baseApi
  .enhanceEndpoints({ addTagTypes: ['Organization', 'OrganizationList'] })
  .injectEndpoints({
    endpoints: (builder) => ({
      listOrganizations: builder.query<
        OrgsResults['listOrganizations'],
        OrgsParams['listOrganizations']
      >({
        query: (params) =>
          orgsService({
            method: 'POST',
            url: '/organizations/query',
            body: params,
          }),
        providesTags: ['OrganizationList'],
      }),
      getOrganization: builder.query<
        OrgsResults['getOrganization'],
        OrgsParams['getOrganization']
      >({
        query: (id) =>
          orgsService({
            method: 'GET',
            url: encode`/group/${id}`,
          }),
        providesTags: (result, error, id) => [{ type: 'Organization', id }],
      }),
      createOrganization: builder.mutation<
        OrgsResults['createOrganization'],
        OrgsParams['createOrganization']
      >({
        query: (org) =>
          orgsService({
            method: 'PUT',
            url: encode`/group/${org.id}`,
            body: {
              name: org.name,
              private: org.isPrivate,
              custom: {
                logourl: org.logoUrl,
                homeurl: org.homeUrl,
                researchinterests: org.researchInterests,
                description: org.description,
              },
            },
          }),
        invalidatesTags: ['OrganizationList'],
      }),
      updateOrganization: builder.mutation<
        OrgsResults['updateOrganization'],
        OrgsParams['updateOrganization']
      >({
        query: ({ id, update }) =>
          orgsService({
            method: 'PUT',
            url: encode`/group/${id}/update`,
            body: {
              name: update.name,
              private: update.isPrivate,
              custom: {
                logourl: update.logoUrl,
                homeurl: update.homeUrl,
                researchinterests: update.researchInterests,
                description: update.description,
              },
            },
          }),
        invalidatesTags: (result, error, { id }) => [
          { type: 'Organization', id },
          'OrganizationList',
        ],
      }),
      requestMembership: builder.mutation<
        OrgsResults['requestMembership'],
        OrgsParams['requestMembership']
      >({
        query: (orgId) =>
          orgsService({
            method: 'POST',
            url: encode`/group/${orgId}/requestmembership`,
          }),
        invalidatesTags: (result, error, orgId) => [
          { type: 'Organization', id: orgId },
        ],
      }),
      inviteUser: builder.mutation<
        OrgsResults['inviteUser'],
        OrgsParams['inviteUser']
      >({
        query: ({ orgId, username }) =>
          orgsService({
            method: 'POST',
            url: encode`/group/${orgId}/user/${username}`,
          }),
        invalidatesTags: (result, error, { orgId }) => [
          { type: 'Organization', id: orgId },
        ],
      }),
      updateMember: builder.mutation<
        OrgsResults['updateMember'],
        OrgsParams['updateMember']
      >({
        query: ({ orgId, username, update }) =>
          orgsService({
            method: 'PUT',
            url: encode`/group/${orgId}/user/${username}/update`,
            body: { custom: update },
          }),
        invalidatesTags: (result, error, { orgId }) => [
          { type: 'Organization', id: orgId },
        ],
      }),
      removeMember: builder.mutation<
        OrgsResults['removeMember'],
        OrgsParams['removeMember']
      >({
        query: ({ orgId, username }) =>
          orgsService({
            method: 'DELETE',
            url: encode`/group/${orgId}/user/${username}`,
          }),
        invalidatesTags: (result, error, { orgId }) => [
          { type: 'Organization', id: orgId },
        ],
      }),
      memberToAdmin: builder.mutation<
        OrgsResults['memberToAdmin'],
        OrgsParams['memberToAdmin']
      >({
        query: ({ orgId, username }) =>
          orgsService({
            method: 'PUT',
            url: encode`/group/${orgId}/user/${username}/admin`,
          }),
        invalidatesTags: (result, error, { orgId }) => [
          { type: 'Organization', id: orgId },
        ],
      }),
      adminToMember: builder.mutation<
        OrgsResults['adminToMember'],
        OrgsParams['adminToMember']
      >({
        query: ({ orgId, username }) =>
          orgsService({
            method: 'DELETE',
            url: encode`/group/${orgId}/user/${username}/admin`,
          }),
        invalidatesTags: (result, error, { orgId }) => [
          { type: 'Organization', id: orgId },
        ],
      }),
      linkNarrative: builder.mutation<
        OrgsResults['linkNarrative'],
        OrgsParams['linkNarrative']
      >({
        query: ({ orgId, wsId }) =>
          orgsService({
            method: 'POST',
            url: encode`/group/${orgId}/resource/workspace/${wsId}`,
          }),
        invalidatesTags: (result, error, { orgId }) => [
          { type: 'Organization', id: orgId },
        ],
      }),
      unlinkNarrative: builder.mutation<
        OrgsResults['unlinkNarrative'],
        OrgsParams['unlinkNarrative']
      >({
        query: ({ orgId, wsId }) =>
          orgsService({
            method: 'DELETE',
            url: encode`/group/${orgId}/resource/workspace/${wsId}`,
          }),
        invalidatesTags: (result, error, { orgId }) => [
          { type: 'Organization', id: orgId },
        ],
      }),
      addApp: builder.mutation<OrgsResults['addApp'], OrgsParams['addApp']>({
        query: ({ orgId, appId }) =>
          orgsService({
            method: 'POST',
            url: encode`/group/${orgId}/resource/catalogmethod/${appId}`,
          }),
        invalidatesTags: (result, error, { orgId }) => [
          { type: 'Organization', id: orgId },
        ],
      }),
      removeApp: builder.mutation<
        OrgsResults['removeApp'],
        OrgsParams['removeApp']
      >({
        query: ({ orgId, appId }) =>
          orgsService({
            method: 'DELETE',
            url: encode`/group/${orgId}/resource/catalogmethod/${appId}`,
          }),
        invalidatesTags: (result, error, { orgId }) => [
          { type: 'Organization', id: orgId },
        ],
      }),
      getNarrativeOrgs: builder.query<
        OrgsResults['getNarrativeOrgs'],
        OrgsParams['getNarrativeOrgs']
      >({
        query: (id) =>
          orgsService({
            method: 'GET',
            url: encode`/group?resourcetype=workspace&resource=${id}`,
          }),
        transformResponse: (response: BriefOrganization[]): OrgInfo[] => {
          return response.map((org) => ({
            id: org.id,
            owner: org.owner.username,
            name: org.name,
            role: org.relation,
            private: org.isPrivate,
          }));
        },
        providesTags: ['OrganizationList'],
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
        providesTags: ['OrganizationList'],
      }),
    }),
  });

export const {
  useListOrganizationsQuery,
  useGetOrganizationQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useRequestMembershipMutation,
  useInviteUserMutation,
  useUpdateMemberMutation,
  useRemoveMemberMutation,
  useMemberToAdminMutation,
  useAdminToMemberMutation,
  useLinkNarrativeMutation,
  useUnlinkNarrativeMutation,
  useAddAppMutation,
  useRemoveAppMutation,
  useGetNarrativeOrgsQuery,
  useGetUserOrgsQuery,
} = orgsApi;

export const { getNarrativeOrgs, getUserOrgs, linkNarrative } =
  orgsApi.endpoints;

export const clearCacheAction = orgsApi.util.invalidateTags([
  'Organization',
  'OrganizationList',
]);
