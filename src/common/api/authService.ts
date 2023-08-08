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

interface AuthParams {
  getUsers: {
    token: string;
    users: string[];
  };
  searchUsers: {
    search: string;
    token: string;
  };
}

interface AuthResults {
  getUsers: Record<string, string>;
  searchUsers: Record<string, string>;
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
    getUsers: builder.query<AuthResults['getUsers'], AuthParams['getUsers']>({
      query: ({ token, users }) =>
        authService({
          headers: {
            Authorization: token,
          },
          method: 'GET',
          params: { list: users.join(',') },
          url: '/api/V2/users',
        }),
    }),
    searchUsers: builder.query<
      AuthResults['searchUsers'],
      AuthParams['searchUsers']
    >({
      query: ({ search, token }) =>
        authService({
          headers: {
            Authorization: token,
          },
          method: 'GET',
          url: `/api/V2/users/search/${search}`,
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

export const { authFromToken, getUsers, searchUsers, revokeToken } =
  authApi.endpoints;
