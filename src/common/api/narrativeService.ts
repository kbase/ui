/* narrativeService */
import { dynamicService } from './serviceWizardApi';
import { baseApi } from './index';

const narrativeService = dynamicService({
  name: 'NarrativeService',
  release: 'release',
});

export interface NarrativeServiceParams {
  copyNarrative: { nameNew: string; workspaceRef: string; workspaceId: number };
  getStatus: void;
  renameNarrative: { nameNew: string; narrativeRef: string };
  restoreNarrative: { objId: number; version: number; wsId: number };
}

interface NarrativeServiceResults {
  copyNarrative: unknown;
  getStatus: { state: string }[];
  renameNarrative: unknown;
  restoreNarrative: unknown;
}

export const narrativeServiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    copyNarrative: builder.mutation<
      NarrativeServiceResults['copyNarrative'],
      NarrativeServiceParams['copyNarrative']
    >({
      query: ({ nameNew, workspaceRef, workspaceId }) =>
        narrativeService({
          method: 'NarrativeService.copy_narrative',
          params: [{ newName: nameNew, workspaceRef, workspaceId }],
        }),
    }),
    getStatus: builder.query<
      NarrativeServiceResults['getStatus'],
      NarrativeServiceParams['getStatus']
    >({
      query: () =>
        narrativeService({
          method: 'NarrativeService.status',
          params: [],
        }),
    }),
    renameNarrative: builder.mutation<
      NarrativeServiceResults['renameNarrative'],
      NarrativeServiceParams['renameNarrative']
    >({
      query: ({ narrativeRef, nameNew }) =>
        narrativeService({
          method: 'NarrativeService.rename_narrative',
          params: [{ narrative_ref: narrativeRef, new_name: nameNew }],
        }),
    }),
    restoreNarrative: builder.mutation<
      NarrativeServiceResults['restoreNarrative'],
      NarrativeServiceParams['restoreNarrative']
    >({
      query: ({ objId, version, wsId }) =>
        narrativeService({
          method: 'NarrativeService.revert_narrative_object',
          params: [{ ver: version, objid: objId, wsid: wsId }],
        }),
    }),
  }),
});

export const { copyNarrative, getStatus, renameNarrative, restoreNarrative } =
  narrativeServiceApi.endpoints;
