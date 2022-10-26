import { baseApi } from './index';
import { jsonRpcService } from './utils/serviceHelpers';

interface HTMLFileSetServParams {
  status: void;
}

interface HTMLFileSetServResults {
  status: {
    state: string;
    message: string;
    version: string;
    git_url: string;
    git_commit_hash: string;
  };
}

const HTMLFileSetServ = jsonRpcService({
  name: 'HTMLFileSetServ',
  release: 'release',
});

export const htmlFileSetServApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    status: builder.query<
      HTMLFileSetServResults['status'],
      HTMLFileSetServParams['status']
    >({
      query: () =>
        HTMLFileSetServ({
          method: 'HTMLFileSetServ.status',
          params: [],
        }),
    }),
  }),
});

export const { status } = htmlFileSetServApi.endpoints;
