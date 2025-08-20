import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { revokeToken } from '../../common/api/authService';
import { Me } from '../../common/types/auth';

export interface TokenInfo {
  created: number;
  expires: number;
  id: string;
  name: string | null;
  type: string;
  user: string;
  cachefor: number;
  mfa: 'USED' | 'NOT_USED' | 'UNKNOWN';
}

interface AuthState {
  initialized: boolean;
  me?: Me;
  token?: string;
  tokenInfo?: TokenInfo;
  username?: string;
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
    setAuthMe: (state, { payload }: PayloadAction<{ me: Me }>) => {
      state.me = payload.me;
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
export const { setAuth, setAuthMe } = authSlice.actions;

export const authUsername = (state: RootState) => {
  return state.auth.username;
};

export const authToken = (state: RootState) => {
  return state.auth.token;
};

export const authInitialized = (state: RootState) => {
  return state.auth.initialized;
};

export const authMe = (state: RootState) => {
  return state.auth.me;
};

function normalizeToken(
  t: string | undefined,
  fallback?: undefined
): string | undefined;
function normalizeToken<T>(t: string | undefined, fallback: T): string | T;
function normalizeToken<T>(t: string | undefined, fallback?: T) {
  return t?.toUpperCase().trim() || fallback;
}

export { normalizeToken };
