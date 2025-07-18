// import { store } from '../../app/store';
import { Me } from '../types/auth';
import { uriEncodeTemplateTag as encode } from '../utils/stringUtils';
import { baseApi } from './index';
import { httpService } from './utils/serviceHelpers';

// In prod, the canonical auth domain is kbase.us, not narrative.kbase.us
// navigating instead to narrative.kbase.us will set the internal cookie
// on the wrong domain.
const authOrigin =
  document.location.origin === 'https://narrative.kbase.us'
    ? 'https://kbase.us'
    : document.location.origin;

const authService = httpService({
  url: '/services/auth',
  domain: authOrigin, // Auth service special-cased to use old kbase prod auth routes. (does NOT use the `narrative.` domain)
});

interface TokenResponse {
  created: number;
  expires: number;
  id: string;
  name: string | null;
  type: string;
  user: string;
  cachefor: number;
  mfaAuthenticated: boolean | null;
}

interface AuthParams {
  getMe: {
    token: string;
  };
  setMe: {
    token: string;
    meUpdate: Pick<Me, 'display' | 'email'>;
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
  loginCreate: {
    id: string;
    user: string;
    display: string;
    email: string;
    linkall: false;
    policyids: string[];
  };
  unlinkID: {
    token: string;
    id: string;
  };
  getLinkChoice: void;
  postLinkPick: {
    token: string;
    id: string;
  };
  getTokens: string;
  revokeToken: string;
  createToken: {
    name: string;
    type: 'service' | 'developer';
  };
}

interface AuthResults {
  getMe: Me;
  setMe: void;
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
  loginCreate: AuthResults['postLoginPick'];
  unlinkID: void;
  getLinkChoice: {
    pickurl: string;
    expires: number;
    provider: string;
    haslinks: boolean;
    user: string;
    cancelurl: string;
    idents: { provusername: string; id: string }[]; // if linkable
    linked: { provusername: string; id: string; user: string }[]; // if already linked
  };
  postLinkPick: void;
  getTokens: {
    current: AuthResults['getTokens']['tokens'][number];
    dev: boolean;
    revokeurl: string;
    service: boolean;
    createurl: string;
    tokens: {
      type: string;
      id: string;
      expires: number;
      created: number;
      user: string;
      custom: unknown;
      os: string;
      osver: string;
      agent: string;
      agentver: string;
      device: string;
      ip: string;
      name?: string;
      mfaAuthenticated: boolean | null;
    }[];
    user: string;
    revokeallurl: string;
  };
  revokeToken: boolean;
  createToken: {
    type: string;
    id: string;
    expires: number;
    created: number;
    user: string;
    custom: unknown;
    os: string;
    osver: string;
    agent: string;
    agentver: string;
    device: string;
    ip: string;
    name?: string;
    token: string;
  };
}

// Auth does not use JSONRpc, so we use queryFn to make custom queries
export const authApi = baseApi
  .enhanceEndpoints({ addTagTypes: ['AccountMe', 'AccountTokens'] })
  .injectEndpoints({
    endpoints: (builder) => ({
      authFromToken: builder.query<TokenResponse, string>({
        query: (token) =>
          authService({
            credentials: 'include',
            url: '/api/V2/token',
            method: 'GET',
            headers: {
              Authorization: token || '',
            },
          }),
      }),
      getMe: builder.query<AuthResults['getMe'], AuthParams['getMe']>({
        query: ({ token }) => {
          return authService({
            credentials: 'include',
            headers: {
              Authorization: token,
            },
            method: 'GET',
            url: '/api/V2/me',
          });
        },
        providesTags: ['AccountMe'],
      }),
      setMe: builder.mutation<AuthResults['setMe'], AuthParams['setMe']>({
        query: ({ token, meUpdate }) => {
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
            credentials: 'include',
            headers: {
              Authorization: token,
            },
            method: 'PUT',
            url: '/me',
            body: meUpdate,
          });
        },
        invalidatesTags: ['AccountMe'],
      }),
      getUsers: builder.query<AuthResults['getUsers'], AuthParams['getUsers']>({
        query: ({ token, users }) =>
          authService({
            credentials: 'include',
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
            credentials: 'include',
            headers: {
              Authorization: token,
            },
            method: 'GET',
            url: `/api/V2/users/search/${search}`,
          }),
      }),
      getTokens: builder.query<
        AuthResults['getTokens'],
        AuthParams['getTokens']
      >({
        query: (token) =>
          authService({
            credentials: 'include',
            headers: {
              accept: 'application/json',
              Authorization: token,
            },
            url: encode`/tokens/`,
            method: 'GET',
          }),
        providesTags: ['AccountTokens'],
      }),
      revokeToken: builder.mutation<
        AuthResults['revokeToken'],
        AuthParams['revokeToken']
      >({
        query: (tokenId) =>
          authService({
            credentials: 'include',
            url: encode`/tokens/revoke/${tokenId}`,
            method: 'DELETE',
          }),
        invalidatesTags: ['AccountTokens'],
      }),
      createToken: builder.mutation<
        AuthResults['createToken'],
        AuthParams['createToken']
      >({
        query: ({ type, name }) =>
          authService({
            credentials: 'include',
            url: encode`/tokens/`,
            method: 'POST',
            body: {
              type,
              name,
            },
          }),
        invalidatesTags: ['AccountTokens'],
      }),
      getLoginChoice: builder.query<
        AuthResults['getLoginChoice'],
        AuthParams['getLoginChoice']
      >({
        query: () =>
          // MUST have an in-process-login-token cookie
          authService({
            credentials: 'include',
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
            credentials: 'include',
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
            credentials: 'include',
            headers: {
              accept: 'application/json',
            },
            method: 'GET',
            url: `/login/suggestname/${encodeURIComponent(username)}`,
          }),
      }),
      loginCreate: builder.mutation<
        AuthResults['loginCreate'],
        AuthParams['loginCreate']
      >({
        query: (params) =>
          // MUST have an in-process-login-token cookie
          authService({
            credentials: 'include',
            headers: {
              accept: 'application/json',
            },
            method: 'POST',
            body: params,
            url: `/login/create/`,
          }),
      }),
      unlinkID: builder.mutation<
        AuthResults['unlinkID'],
        AuthParams['unlinkID']
      >({
        query: ({ token, id }) =>
          authService({
            credentials: 'include',
            headers: {
              Authorization: token,
            },
            method: 'POST',
            url: `/me/unlink/${id}`,
          }),
        invalidatesTags: ['AccountMe'],
      }),

      getLinkChoice: builder.query<
        AuthResults['getLinkChoice'],
        AuthParams['getLinkChoice']
      >({
        query: () =>
          // MUST have an in-process-link-token cookie
          authService({
            credentials: 'include',
            headers: {
              accept: 'application/json',
            },
            method: 'GET',
            url: '/link/choice',
          }),
      }),
      postLinkPick: builder.mutation<
        AuthResults['postLinkPick'],
        AuthParams['postLinkPick']
      >({
        query: ({ token, id }) =>
          authService({
            credentials: 'include',
            headers: {
              Authorization: token,
            },
            url: encode`/link/pick`,
            body: { id },
            method: 'POST',
          }),
        invalidatesTags: ['AccountMe'],
      }),
    }),
  });

export const {
  authFromToken,
  getMe,
  setMe,
  getUsers,
  searchUsers,
  getTokens,
  revokeToken,
  createToken,
  getLoginChoice,
  postLoginPick,
  loginUsernameSuggest,
  loginCreate,
  unlinkID,
  getLinkChoice,
  postLinkPick,
} = authApi.endpoints;
export type GetLoginChoiceResult = AuthResults['getLoginChoice'];
