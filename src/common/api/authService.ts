import { baseApi } from './index';
import { httpService } from './utils/serviceHelpers';
import { uriEncodeTemplateTag as encode } from '../utils/stringUtils';

const authService = httpService({
  url: '/services/auth',
});

interface TokenResponse {
  created: number;
  expires: number;
  id: string;
  name: string | null;
  type: string;
  user: string;
  cachefor: number;
}

// Auth does not use JSONRpc, so we use queryFn to make custom queries
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    authFromToken: builder.query<TokenResponse, string>({
      query: (token) =>
        authService({
          url: '/api/V2/token',
          method: 'GET',
          headers: {
            Authorization: token || '',
          },
        }),
    }),
    revokeToken: builder.mutation<boolean, string>({
      query: (tokenId) =>
        authService({
          url: encode`/tokens/revoke/${tokenId}`,
          method: 'DELETE',
        }),
    }),
  }),
});

export const { authFromToken, revokeToken } = authApi.endpoints;
