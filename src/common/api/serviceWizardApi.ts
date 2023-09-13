/* serviceWizardApi */
import { baseApi } from './index';
import { setConsumedService } from './utils/kbaseBaseQuery';
import { jsonRpcService } from './utils/serviceHelpers';

const serviceWizard = jsonRpcService({ url: 'services/service_wizard' });

const dynamicService = jsonRpcService;

/* Use this for dynamic services to ensure serviceWizardApi is set. */
export { dynamicService };

interface ServiceStatus {
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

interface ServiceWizardParams {
  getServiceStatus: { module_name: string; version: string };
}

interface ServiceWizardResults {
  getServiceStatus: ServiceStatus[];
}

export const serviceWizardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServiceStatus: builder.query<
      ServiceWizardResults['getServiceStatus'],
      ServiceWizardParams['getServiceStatus']
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

export const { getServiceStatus } = serviceWizardApi.endpoints;
