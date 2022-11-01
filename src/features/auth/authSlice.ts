import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useEffect } from 'react';
import { RootState } from '../../app/store';
import { authFromToken, revokeToken } from '../../common/api/authService';
import { useCookie } from '../../common/cookie';
import { useAppDispatch, useAppSelector } from '../../common/hooks';

export interface TokenInfo {
  created: number;
  expires: number;
  id: string;
  name: string | null;
  type: string;
  user: string;
  cachefor: number;
}

interface AuthState {
  initialized: boolean;
  token?: string;
  username?: string;
  tokenInfo?: TokenInfo;
}

const initialState: AuthState = {
  initialized: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (
      state,
      {
        payload,
      }: PayloadAction<{
        token: string;
        username: string;
        tokenInfo: TokenInfo;
      } | null>
    ) => {
      const normToken = normalizeToken(payload?.token);
      state.token = normToken;
      state.username = payload?.username;
      state.tokenInfo = payload?.tokenInfo;
      state.initialized = true;
    },
  },
  extraReducers: (builder) =>
    builder.addMatcher(revokeToken.matchFulfilled, (state, action) => {
      // Clear current token if it's been revoked when revokeToken succeeds
      const revokedTokenId = action.meta.arg.originalArgs;
      if (revokedTokenId === state.tokenInfo?.id) {
        state.token = undefined;
        state.username = undefined;
        state.tokenInfo = undefined;
      }
    }),
});

export default authSlice.reducer;
export const { setAuth } = authSlice.actions;

export const authUsername = (state: RootState) => {
  return state.auth.username;
};

export const authToken = (state: RootState) => {
  return state.auth.token;
};

export const authInitialized = (state: RootState) => {
  return state.auth.initialized;
};

export const useTryAuthFromToken = (token?: string) => {
  const dispatch = useAppDispatch();
  const currentToken = useAppSelector(authToken);
  const normToken = normalizeToken(token, '');

  const tokenQuery = authFromToken.useQuery(normToken, {
    skip: !normToken,
  });

  useEffect(() => {
    if (tokenQuery.isSuccess && normToken !== currentToken) {
      dispatch(
        setAuth({
          token: normToken,
          username: tokenQuery.data.user,
          tokenInfo: tokenQuery.data,
        })
      );
    }
  }, [
    currentToken,
    dispatch,
    normToken,
    tokenQuery.data,
    tokenQuery.isSuccess,
  ]);

  return tokenQuery;
};

/**
 * Initializes auth from a cookie, then continues to monitor and update that cookie as appropriate.
 */
export const useTokenCookie = (name: string) => {
  const dispatch = useAppDispatch();

  // Pull token from cookie. If it exists, and differs from state, try it for auth.
  const [cookieToken, setCookieToken, clearCookieToken] = useCookie(name);
  const { isSuccess, isFetching } = useTryAuthFromToken(cookieToken);

  // Pull token, expiration, and init info from auth state
  const token = useAppSelector(authToken);
  const expires = useAppSelector(({ auth }) => auth.tokenInfo?.expires);
  const initialized = useAppSelector(authInitialized);

  // Initializes auth for states where useTryAuthFromToken does not set auth
  useEffect(() => {
    if (isFetching || initialized) return;
    if (!cookieToken) {
      dispatch(setAuth(null));
    } else if (!isSuccess) {
      dispatch(setAuth(null));
    }
  }, [isFetching, initialized, cookieToken, dispatch, isSuccess]);

  // Set the cookie according to the initialized auth state
  useEffect(() => {
    if (!initialized) return;
    if (token && expires) {
      setCookieToken(token, {
        expires: new Date(expires),
        ...(process.env.NODE_ENV === 'development'
          ? {}
          : { domain: process.env.REACT_APP_KBASE_DOMAIN }),
      });
    } else if (token && !expires) {
      // eslint-disable-next-line no-console
      console.error('Could not set token cookie, missing expire time');
    } else if (!token) {
      clearCookieToken();
    }
  }, [initialized, token, expires, setCookieToken, clearCookieToken]);
};

function normalizeToken(
  t: string | undefined,
  fallback?: undefined
): string | undefined;
function normalizeToken<T>(t: string | undefined, fallback: T): string | T;
function normalizeToken<T>(t: string | undefined, fallback?: T) {
  return t?.toUpperCase().trim() || fallback;
}
