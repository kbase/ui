// import { store } from '../../app/store';
import { Me } from '../types/auth';
import { uriEncodeTemplateTag as encode } from '../utils/stringUtils';
import { baseApi } from './index';
import { httpService } from './utils/serviceHelpers';

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
  getMe: {
    token: string;
  };
  getUsers: {
    token: string;
    users: string[];
  };
  searchUsers: {
    search: string;
    token: string;
  };
  getLoginChoice: void;
  postLoginPick: { id: string; policyids: string[] };
  loginUsernameSuggest: string;
}

interface AuthResults {
  getMe: Me;
  getUsers: Record<string, string>;
  searchUsers: Record<string, string>;
  getLoginChoice: {
    // cancelurl: string;
    create: {
      availablename: string;
      id: string;
      provemail: string;
      provfullname: string;
      provusername: string;
    }[];
    // createurl: string;
    creationallowed: true;
    expires: number;
    login: {
      adminonly: boolean;
      disabled: boolean;
      id: string;
      loginallowed: true;
      policyids: {
        agreedon: number;
        id: string;
      }[];
      provusernames: string[];
      user: string;
    }[];
    // pickurl: string;
    provider: string;
    // redirecturl: string | null;
    // suggestnameurl: string;
  };
  postLoginPick: {
    redirecturl: null | string;
    token: {
      agent: string;
      agentver: string;
      created: number;
      custom: unknown;
      device: unknown;
      expires: number;
      id: string;
      ip: string;
      name: unknown;
      os: unknown;
      osver: unknown;
      token: string;
      type: string;
      user: string;
    };
  };
  loginUsernameSuggest: { availablename: string };
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
    getMe: builder.query<AuthResults['getMe'], AuthParams['getMe']>({
      query: ({ token }) => {
        /* I want to do
        const token = store.getState().auth.token;
        but authSlice imports revokeToken defined here,
        so this becomes a circular depenency.
        Specifically the error is:
          7022: 'token' implicitly has type 'any' because it does not have a
          type annotation and is referenced directly or indirectly in its own
          initializer.
        */
        return authService({
          headers: {
            Authorization: token,
          },
          method: 'GET',
          url: '/api/V2/me',
        });
      },
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
    getLoginChoice: builder.query<
      AuthResults['getLoginChoice'],
      AuthParams['getLoginChoice']
    >({
      query: () =>
        // MUST have an in-process-login-token cookie
        authService({
          headers: {
            accept: 'application/json',
          },
          method: 'GET',
          url: '/login/choice',
        }),
    }),
    postLoginPick: builder.mutation<
      AuthResults['postLoginPick'],
      AuthParams['postLoginPick']
    >({
      query: (pickedChoice) =>
        authService({
          url: encode`/login/pick`,
          body: pickedChoice,
          method: 'POST',
        }),
    }),
    loginUsernameSuggest: builder.query<
      AuthResults['loginUsernameSuggest'],
      AuthParams['loginUsernameSuggest']
    >({
      query: (username) =>
        // MUST have an in-process-login-token cookie
        authService({
          headers: {
            accept: 'application/json',
          },
          method: 'GET',
          url: `/login/suggestname/${encodeURIComponent(username)}`,
        }),
    }),
  }),
});

export const {
  authFromToken,
  getMe,
  getUsers,
  searchUsers,
  revokeToken,
  getLoginChoice,
  postLoginPick,
  loginUsernameSuggest,
} = authApi.endpoints;
export type GetLoginChoiceResult = AuthResults['getLoginChoice'];
