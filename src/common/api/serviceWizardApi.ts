import { baseApi } from './index';
import { setConsumedService } from './utils/kbaseBaseQuery';
import { jsonRpcService } from './utils/serviceHelpers';

const serviceWizard = jsonRpcService({ url: 'services/service_wizard' });

interface ServiceWizardParams {
  serviceStatus: { module_name: string; version: string };
}

interface ServiceWizardResults {
  serviceStatus: [
    {
      git_commit_hash: string;
      status: string;
      version: string;
      hash: string;
      release_tags: string[];
      url: string;
      module_name: string;
      health: string;
      up: number;
    }
  ];
}

export const serviceWizardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    serviceStatus: builder.query<
      ServiceWizardResults['serviceStatus'],
      ServiceWizardParams['serviceStatus']
    >({
      query: ({ module_name, version }) =>
        serviceWizard({
          method: 'ServiceWizard.get_service_status',
          params: [{ module_name, version }],
        }),
      keepUnusedDataFor: 300,
    }),
  }),
});

setConsumedService('serviceWizardApi', serviceWizardApi);

export const { serviceStatus } = serviceWizardApi.endpoints;
