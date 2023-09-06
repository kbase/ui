import { Cell } from '../types/NarrativeDoc';
import { baseApi } from './index';
import { jsonRpcService } from './utils/serviceHelpers';

const ws = jsonRpcService({
  url: '/services/ws',
});

/*
Workspace permissions cheat sheet:
https://kbase.us/services/ws/docs/workspaces.html#permissions
Permission: Allows
----------:----------
         a: Admin access, set permissions of other users
         n: No access
         r: Read access
         w: Write access, see permissions of other users
*/
type PermissionValue = 'a' | 'n' | 'r' | 'w';
type TimeParams = (
  | { after?: never; after_epoch?: number }
  | { after_epoch?: never; after?: string }
) &
  (
    | { before?: never; before_epoch?: number }
    | { before_epoch?: never; before?: string }
  );

interface wsParams {
  deleteWorkspace: { reqId?: number | string; wsId: number };
  getwsNarrative: { upa: string };
  getwsObjectByName: { upa: string };
  getwsPermissions: { wsId: number };
  listObjects: {
    ids?: number[];
    workspaces?: string[];
    type?: string;
    savedby?: string[];
    meta?: Record<string, string>;
    startafter?: string;
    minObjectID?: number;
    maxObjectID?: number;
    showDeleted?: boolean;
    showOnlyDeleted?: boolean;
    showHidden?: boolean;
    showAllVersions?: boolean;
    includeMetadata?: boolean;
    excludeGlobal?: boolean;
    limit?: number;
  } & TimeParams;
  listWorkspaceInfo: {
    perm?: string;
    owners?: string[];
    meta?: Record<string, string>;
    excludeGlobal?: boolean;
    showDeleted?: boolean;
    showOnlyDeleted?: boolean;
  } & TimeParams;
}

interface wsResults {
  deleteWorkspace: {};
  getwsNarrative: {
    data: {
      data: {
        cells: Cell[];
      };
    }[];
  }[];
  getwsObjectByName: unknown;
  getwsPermissions: {
    perms: Record<string, PermissionValue>[];
  }[];
  listWorkspaceInfo: [
    id: number,
    workspace: string,
    owner: string,
    moddate: string,
    maxobjid: number,
    user_permission: string,
    globalread: string,
    lockstat: string,
    metadata: Record<string, string>
  ][][];
  listObjects: [
    obj_id: number,
    name: string,
    type: string,
    save_date: string,
    version: number,
    saved_by: string,
    ws_id: number,
    ws_name: string,
    chsum: string,
    size: number,
    meta: Record<string, string>
  ][][];
}

const wsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    deleteWorkspace: builder.mutation<
      wsResults['deleteWorkspace'],
      wsParams['deleteWorkspace']
    >({
      query: ({ wsId, reqId }) =>
        ws({
          method: 'Workspace.delete_workspace',
          params: [{ workspaces: [{ id: wsId }] }],
        }),
    }),
    getwsNarrative: builder.query<
      wsResults['getwsNarrative'],
      wsParams['getwsNarrative']
    >({
      query: ({ upa }) =>
        ws({
          method: 'Workspace.get_objects2',
          params: [{ objects: [{ ref: upa }] }],
        }),
    }),
    getwsObjectByName: builder.query<
      wsResults['getwsObjectByName'],
      wsParams['getwsObjectByName']
    >({
      query: ({ upa }) =>
        ws({
          method: 'Workspace.get_objects2',
          params: [{ objects: [{ ref: upa }] }],
        }),
    }),
    getwsPermissions: builder.query<
      wsResults['getwsPermissions'],
      wsParams['getwsPermissions']
    >({
      query: ({ wsId }) =>
        ws({
          method: 'Workspace.get_permissions_mass',
          params: [{ workspaces: [{ id: wsId }] }],
        }),
    }),
    listObjects: builder.query<
      wsResults['listObjects'],
      wsParams['listObjects']
    >({
      query: (params) =>
        ws({
          method: 'Workspace.list_objects',
          params: [params],
        }),
    }),
    listWorkspaceInfo: builder.query<
      wsResults['listWorkspaceInfo'],
      wsParams['listWorkspaceInfo']
    >({
      query: (params) =>
        ws({
          method: 'Workspace.list_workspace_info',
          params: [params],
        }),
    }),
  }),
});

export const {
  deleteWorkspace,
  getwsNarrative,
  getwsObjectByName,
  getwsPermissions,
  listObjects,
  listWorkspaceInfo,
} = wsApi.endpoints;
