/* narrativeService */
import { dynamicService } from './serviceWizardApi';
import { baseApi } from './index';

const narrativeService = dynamicService({
  name: 'NarrativeService',
  release: 'release',
});

export interface NarrativeServiceParams {
  getStatus: void;
}

interface NarrativeServiceResults {
  getStatus: unknown;
}

export const narrativeServiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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

export const { getStatus } = narrativeServiceApi.endpoints;
