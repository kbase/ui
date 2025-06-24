/* orgsApi.ts */
import { uriEncodeTemplateTag as encode } from '../utils/stringUtils';
import { httpService } from './utils/serviceHelpers';
import { baseApi } from './index';

const orgsService = httpService({
  url: '/services/groups/',
});

export type Role = 'None' | 'Member' | 'Admin' | 'Owner';

// Groups service raw response format (list view)
interface GroupsServiceResponse {
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

// Groups service User structure
interface GroupsServiceUser {
  name: string;
  joined: number | null;
  lastvisit: number | null;
  custom: Record<string, unknown>;
}

// Groups service detailed group response format
interface GroupsServiceDetailResponse {
  id: string;
  name: string;
  private: boolean;
  privatemembers: boolean;
  owner: GroupsServiceUser;
  role: Role;
  memcount: number;
  createdate: number;
  moddate: number;
  lastvisit: number | null;
  admins: GroupsServiceUser[];
  members: GroupsServiceUser[];
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

          return orgsService({
            method: 'GET',
            url,
          });
        },
        transformResponse: (
          response: GroupsServiceResponse[]
        ): OrgsResults['listOrganizations'] => {
          const organizations = response.map((group) => ({
            id: group.id,
            name: group.name,
            logoUrl: group.custom?.logourl || null,
            isPrivate: group.private,
            homeUrl: group.custom?.homeurl || null,
            researchInterests: group.custom?.researchinterests || null,
            owner: {
              username: group.owner,
              realname: group.owner,
            },
            relation: group.role,
            isMember: ['Member', 'Admin', 'Owner'].includes(group.role),
            isAdmin: ['Admin', 'Owner'].includes(group.role),
            isOwner: group.role === 'Owner',
            createdAt: new Date(group.createdate).toISOString(),
            modifiedAt: new Date(group.moddate).toISOString(),
            lastVisitedAt: group.lastvisit
              ? new Date(group.lastvisit).toISOString()
              : null,
            memberCount: group.memcount,
            narrativeCount: group.rescount?.workspace || 0,
            appCount: group.rescount?.catalogmethod || 0,
            relatedOrganizations: group.custom?.relatedgroups
              ? group.custom.relatedgroups.split(',')
              : [],
          }));

          return {
            organizations,
            total: organizations.length,
          };
        },
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
        transformResponse: (
          response: GroupsServiceDetailResponse
        ): Organization => {
          // Convert Groups service users to our Member format
          const convertUser = (
            user: GroupsServiceUser,
            type: 'member' | 'admin' | 'owner'
          ): Member => ({
            username: user.name,
            realname: user.name, // Groups service doesn't provide real names
            joinedAt: user.joined
              ? new Date(user.joined).toISOString()
              : new Date().toISOString(),
            lastVisitedAt: user.lastvisit
              ? new Date(user.lastvisit).toISOString()
              : null,
            type,
            title: (user.custom?.title as string) || null,
            isVisible: true,
          });

          // Combine all members (owner, admins, members)
          const allMembers: Member[] = [
            convertUser(response.owner, 'owner'),
            ...response.admins.map((user) => convertUser(user, 'admin')),
            ...response.members.map((user) => convertUser(user, 'member')),
          ];

          // Convert workspace resources to narratives
          const narratives: NarrativeResource[] = (
            response.resources?.workspace || []
          ).map((ws) => ({
            workspaceId: parseInt(ws.rid),
            title: (ws.name as string) || `Workspace ${ws.rid}`,
            permission:
              (ws.perm as 'view' | 'edit' | 'admin' | 'owner') || 'view',
            isPublic: (ws.public as boolean) || false,
            createdAt: ws.createdate
              ? new Date(ws.createdate as number).toISOString()
              : new Date().toISOString(),
            updatedAt: ws.moddate
              ? new Date(ws.moddate as number).toISOString()
              : new Date().toISOString(),
            addedAt: ws.added ? new Date(ws.added).toISOString() : null,
            description: (ws.description as string) || '',
            isVisible: true,
          }));

          // Convert catalogmethod resources to apps
          const apps: AppResource[] = (
            response.resources?.catalogmethod || []
          ).map((method) => ({
            appId: method.rid,
            addedAt: method.added ? new Date(method.added).toISOString() : null,
            isVisible: true,
          }));

          return {
            id: response.id,
            name: response.name,
            logoUrl: response.custom?.logourl || null,
            isPrivate: response.private,
            homeUrl: response.custom?.homeurl || null,
            researchInterests: response.custom?.researchinterests || null,
            owner: {
              username: response.owner.name,
              realname: response.owner.name,
            },
            relation: response.role,
            isMember: ['Member', 'Admin', 'Owner'].includes(response.role),
            isAdmin: ['Admin', 'Owner'].includes(response.role),
            isOwner: response.role === 'Owner',
            createdAt: new Date(response.createdate).toISOString(),
            modifiedAt: new Date(response.moddate).toISOString(),
            lastVisitedAt: response.lastvisit
              ? new Date(response.lastvisit).toISOString()
              : null,
            memberCount: response.memcount,
            narrativeCount: response.rescount?.workspace || 0,
            appCount: response.rescount?.catalogmethod || 0,
            relatedOrganizations: response.custom?.relatedgroups
              ? response.custom.relatedgroups.split(',')
              : [],
            description: response.custom?.description || '',
            areMembersPrivate: response.privatemembers,
            members: allMembers,
            narratives,
            apps,
          };
        },
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
  listOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
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
  getUserOrgs,
} = orgsApi.endpoints;

export const clearCacheAction = orgsApi.util.invalidateTags([
  'Organization',
  'OrganizationList',
]);
