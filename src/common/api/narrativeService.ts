/* narrativeService */
import { dynamicService } from './serviceWizardApi';
import { baseApi } from './index';

const narrativeService = dynamicService({
  name: 'NarrativeService',
  release: 'release',
});

export interface NarrativeServiceParams {
  getStatus: void;
  restoreNarrative: { objId: number; version: number; wsId: number };
}

interface NarrativeServiceResults {
  getStatus: unknown;
  restoreNarrative: unknown;
}

export const narrativeServiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
});

export const { getStatus, restoreNarrative } = narrativeServiceApi.endpoints;
