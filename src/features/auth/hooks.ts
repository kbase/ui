/* auth/hooks */
import { useEffect } from 'react';
import { authFromToken, getMe } from '../../common/api/authService';
import { useCookie } from '../../common/cookie';
import { useAppDispatch, useAppSelector } from '../../common/hooks';
import {
  authInitialized,
  authToken,
  setAuth,
  setAuthMe,
  normalizeToken,
} from './authSlice';

export const useAuthMe = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector(authToken) || '';
  const authAPIQuery = getMe.useQuery({ token });
  useEffect(() => {
    if (authAPIQuery && authAPIQuery.isSuccess && authAPIQuery.data) {
      const data = authAPIQuery.data;
      dispatch(setAuthMe({ me: data }));
    }
  }, [authAPIQuery, dispatch]);
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
        ...(import.meta.env.DEV
          ? {}
          : { domain: import.meta.env.VITE_KBASE_DOMAIN }),
      });
    } else if (token && !expires) {
      // eslint-disable-next-line no-console
      console.error('Could not set token cookie, missing expire time');
    } else if (!token) {
      clearCookieToken();
    }
  }, [initialized, token, expires, setCookieToken, clearCookieToken]);
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
