import { uriEncodeTemplateTag as encode } from '../utils/stringUtils';
import { httpService } from './utils/serviceHelpers';
import { baseApi } from './index';

const groupsService = httpService({
  url: '/services/groups/',
});

export type Role = 'None' | 'Member' | 'Admin' | 'Owner';

// Groups service response for list view
export interface Group {
  id: string;
  name: string;
  private: boolean;
  owner: string;
  role: Role;
  memcount: number;
  createdate: number;
  moddate: number;
  lastvisit: number | null;
  rescount?: {
    workspace?: number;
    catalogmethod?: number;
  };
  custom?: {
    logourl?: string;
    homeurl?: string;
    researchinterests?: string;
    relatedgroups?: string;
    description?: string;
  };
}

// Groups service user structure
export interface GroupUser {
  name: string;
  joined: number | null;
  lastvisit: number | null;
  custom: Record<string, unknown>;
}

// Groups service response for detail view
export interface GroupDetail {
  id: string;
  name: string;
  private: boolean;
  privatemembers: boolean;
  owner: GroupUser;
  role: Role;
  memcount: number;
  createdate: number;
  moddate: number;
  lastvisit: number | null;
  admins: GroupUser[];
  members: GroupUser[];
  rescount?: {
    workspace?: number;
    catalogmethod?: number;
  };
  resources?: {
    workspace?: Array<{
      rid: string;
      added: number | null;
      [key: string]: unknown;
    }>;
    catalogmethod?: Array<{ rid: string; added: number | null }>;
  };
  custom?: {
    logourl?: string;
    homeurl?: string;
    researchinterests?: string;
    relatedgroups?: string;
    description?: string;
  };
}

// Legacy interface for narrative organizations API
export interface NarrativeOrgInfo {
  id: string;
  owner: string;
  name: string;
  role: string;
  private: boolean;
}

export interface GroupRequest {
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

export interface GroupFilter {
  roleType: 'myorgs' | 'all' | 'notmyorgs' | 'select';
  roles: string[];
  privacy: 'any' | 'public' | 'private';
}

export interface GroupQuery {
  searchTerms: string[];
  sortField: string;
  sortDirection: 'ascending' | 'descending';
  filter: GroupFilter;
}

export interface CreateGroupInput {
  id: string;
  name: string;
  logoUrl?: string;
  homeUrl?: string;
  researchInterests?: string;
  description?: string;
  isPrivate: boolean;
}

export interface UpdateGroupInput {
  name: string;
  logoUrl?: string;
  homeUrl?: string;
  researchInterests?: string;
  description?: string;
  isPrivate: boolean;
}

export interface GroupsApiParams {
  listGroups: GroupQuery;
  getGroup: string;
  createGroup: CreateGroupInput;
  updateGroup: { id: string; update: UpdateGroupInput };
  deleteGroup: string;
  requestMembership: string;
  inviteUser: { groupId: string; username: string };
  updateMember: {
    groupId: string;
    username: string;
    update: { title?: string };
  };
  removeMember: { groupId: string; username: string };
  memberToAdmin: { groupId: string; username: string };
  adminToMember: { groupId: string; username: string };
  getNarrativeOrgs: number;
  getUserGroups: void;
  linkNarrative: { groupId: string; wsId: number };
  unlinkNarrative: { groupId: string; wsId: number };
  addApp: { groupId: string; appId: string };
  removeApp: { groupId: string; appId: string };
  getRequests: string;
  acceptRequest: string;
  denyRequest: string;
  cancelRequest: string;
}

export interface GroupsApiResults {
  listGroups: Group[];
  getGroup: GroupDetail;
  createGroup: GroupDetail;
  updateGroup: void;
  deleteGroup: void;
  requestMembership: GroupRequest;
  inviteUser: GroupRequest;
  updateMember: void;
  removeMember: void;
  memberToAdmin: void;
  adminToMember: void;
  getNarrativeOrgs: NarrativeOrgInfo[];
  getUserGroups: Group[];
  linkNarrative: unknown;
  unlinkNarrative: void;
  addApp: unknown;
  removeApp: void;
  getRequests: GroupRequest[];
  acceptRequest: GroupRequest;
  denyRequest: GroupRequest;
  cancelRequest: GroupRequest;
}

export const groupsApi = baseApi
  .enhanceEndpoints({ addTagTypes: ['Group', 'GroupList'] })
  .injectEndpoints({
    endpoints: (builder) => ({
      listGroups: builder.query<
        GroupsApiResults['listGroups'],
        GroupsApiParams['listGroups']
      >({
        query: (params) => {
          const searchParams = new URLSearchParams();

          if (params.filter.roleType !== 'all') {
            if (params.filter.roleType === 'myorgs') {
              searchParams.append('role', 'Member');
            } else if (params.filter.roles.length > 0) {
              searchParams.append('role', params.filter.roles[0]);
            }
          }

          if (params.sortDirection === 'descending') {
            searchParams.append('order', 'desc');
          } else {
            searchParams.append('order', 'asc');
          }

          const queryString = searchParams.toString();
          const url = queryString ? `/group?${queryString}` : '/group';

          return groupsService({
            method: 'GET',
            url,
          });
        },
        providesTags: ['GroupList'],
      }),
      getGroup: builder.query<
        GroupsApiResults['getGroup'],
        GroupsApiParams['getGroup']
      >({
        query: (id) =>
          groupsService({
            method: 'GET',
            url: encode`/group/${id}`,
          }),
        providesTags: (result, error, id) => [{ type: 'Group', id }],
      }),
      createGroup: builder.mutation<
        GroupsApiResults['createGroup'],
        GroupsApiParams['createGroup']
      >({
        query: (group) =>
          groupsService({
            method: 'PUT',
            url: encode`/group/${group.id}`,
            body: {
              name: group.name,
              private: group.isPrivate,
              custom: {
                logourl: group.logoUrl,
                homeurl: group.homeUrl,
                researchinterests: group.researchInterests,
                description: group.description,
              },
            },
          }),
        invalidatesTags: ['GroupList'],
      }),
      updateGroup: builder.mutation<
        GroupsApiResults['updateGroup'],
        GroupsApiParams['updateGroup']
      >({
        query: ({ id, update }) =>
          groupsService({
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
          { type: 'Group', id },
          'GroupList',
        ],
      }),
      requestMembership: builder.mutation<
        GroupsApiResults['requestMembership'],
        GroupsApiParams['requestMembership']
      >({
        query: (groupId) =>
          groupsService({
            method: 'POST',
            url: encode`/group/${groupId}/requestmembership`,
          }),
        invalidatesTags: (result, error, groupId) => [
          { type: 'Group', id: groupId },
        ],
      }),
      inviteUser: builder.mutation<
        GroupsApiResults['inviteUser'],
        GroupsApiParams['inviteUser']
      >({
        query: ({ groupId, username }) =>
          groupsService({
            method: 'POST',
            url: encode`/group/${groupId}/user/${username}`,
          }),
        invalidatesTags: (result, error, { groupId }) => [
          { type: 'Group', id: groupId },
        ],
      }),
      updateMember: builder.mutation<
        GroupsApiResults['updateMember'],
        GroupsApiParams['updateMember']
      >({
        query: ({ groupId, username, update }) =>
          groupsService({
            method: 'PUT',
            url: encode`/group/${groupId}/user/${username}/update`,
            body: { custom: update },
          }),
        invalidatesTags: (result, error, { groupId }) => [
          { type: 'Group', id: groupId },
        ],
      }),
      removeMember: builder.mutation<
        GroupsApiResults['removeMember'],
        GroupsApiParams['removeMember']
      >({
        query: ({ groupId, username }) =>
          groupsService({
            method: 'DELETE',
            url: encode`/group/${groupId}/user/${username}`,
          }),
        invalidatesTags: (result, error, { groupId }) => [
          { type: 'Group', id: groupId },
        ],
      }),
      memberToAdmin: builder.mutation<
        GroupsApiResults['memberToAdmin'],
        GroupsApiParams['memberToAdmin']
      >({
        query: ({ groupId, username }) =>
          groupsService({
            method: 'PUT',
            url: encode`/group/${groupId}/user/${username}/admin`,
          }),
        invalidatesTags: (result, error, { groupId }) => [
          { type: 'Group', id: groupId },
        ],
      }),
      adminToMember: builder.mutation<
        GroupsApiResults['adminToMember'],
        GroupsApiParams['adminToMember']
      >({
        query: ({ groupId, username }) =>
          groupsService({
            method: 'DELETE',
            url: encode`/group/${groupId}/user/${username}/admin`,
          }),
        invalidatesTags: (result, error, { groupId }) => [
          { type: 'Group', id: groupId },
        ],
      }),
      linkNarrative: builder.mutation<
        GroupsApiResults['linkNarrative'],
        GroupsApiParams['linkNarrative']
      >({
        query: ({ groupId, wsId }) =>
          groupsService({
            method: 'POST',
            url: encode`/group/${groupId}/resource/workspace/${wsId}`,
          }),
        invalidatesTags: (result, error, { groupId }) => [
          { type: 'Group', id: groupId },
        ],
      }),
      unlinkNarrative: builder.mutation<
        GroupsApiResults['unlinkNarrative'],
        GroupsApiParams['unlinkNarrative']
      >({
        query: ({ groupId, wsId }) =>
          groupsService({
            method: 'DELETE',
            url: encode`/group/${groupId}/resource/workspace/${wsId}`,
          }),
        invalidatesTags: (result, error, { groupId }) => [
          { type: 'Group', id: groupId },
        ],
      }),
      addApp: builder.mutation<
        GroupsApiResults['addApp'],
        GroupsApiParams['addApp']
      >({
        query: ({ groupId, appId }) =>
          groupsService({
            method: 'POST',
            url: encode`/group/${groupId}/resource/catalogmethod/${appId}`,
          }),
        invalidatesTags: (result, error, { groupId }) => [
          { type: 'Group', id: groupId },
        ],
      }),
      removeApp: builder.mutation<
        GroupsApiResults['removeApp'],
        GroupsApiParams['removeApp']
      >({
        query: ({ groupId, appId }) =>
          groupsService({
            method: 'DELETE',
            url: encode`/group/${groupId}/resource/catalogmethod/${appId}`,
          }),
        invalidatesTags: (result, error, { groupId }) => [
          { type: 'Group', id: groupId },
        ],
      }),
      getNarrativeOrgs: builder.query<
        GroupsApiResults['getNarrativeOrgs'],
        GroupsApiParams['getNarrativeOrgs']
      >({
        query: (id) =>
          groupsService({
            method: 'GET',
            url: encode`/group?resourcetype=workspace&resource=${id}`,
          }),
        providesTags: ['GroupList'],
      }),
      getUserGroups: builder.query<
        GroupsApiResults['getUserGroups'],
        GroupsApiParams['getUserGroups']
      >({
        query: () =>
          groupsService({
            method: 'GET',
            url: '/member',
          }),
        providesTags: ['GroupList'],
      }),
    }),
  });

export const {
  listGroups,
  getGroup,
  createGroup,
  updateGroup,
  requestMembership,
  inviteUser,
  updateMember,
  removeMember,
  memberToAdmin,
  adminToMember,
  linkNarrative,
  unlinkNarrative,
  addApp,
  removeApp,
  getNarrativeOrgs,
  getUserGroups,
} = groupsApi.endpoints;

export const clearCacheAction = groupsApi.util.invalidateTags([
  'Group',
  'GroupList',
]);

// Legacy exports for backwards compatibility
export const listOrganizations = listGroups;
export const getOrganization = getGroup;
export const getUserOrgs = getUserGroups;
export type GroupsServiceResponse = Group;
export type GroupsServiceDetailResponse = GroupDetail;
export type Filter = GroupFilter;
export type OrganizationQuery = GroupQuery;
export const createOrganization = createGroup;
export type OrgInfo = NarrativeOrgInfo;
export type CreateOrganizationInput = CreateGroupInput;
