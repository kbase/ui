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
export const useTokenCookie = (
  cookieName: string,
  backupCookieName?: string,
  backupCookieDomain?: string
) => {
  const dispatch = useAppDispatch();

  // Pull token from main cookie. If it exists, and differs from state, try it for auth.
  const [cookieToken, setCookieToken, clearCookieToken] = useCookie(cookieName);
  const { isSuccess, isFetching, isUninitialized } =
    useTryAuthFromToken(cookieToken);

  // Controls for backupCookie
  const [backupCookieToken, setBackupCookieToken, clearBackupCookieToken] =
    useCookie(backupCookieName);

  // Pull token, expiration, and init info from auth state
  const token = useAppSelector(authToken);
  const expires = useAppSelector(({ auth }) => auth.tokenInfo?.expires);
  const appAuthInitialized = useAppSelector(authInitialized);

  // Initializes auth for states where useTryAuthFromToken does not set auth
  useEffect(() => {
    // If the cookieToken is present but it failed checks and wont be overwritten by a token in state, clear
    if (
      cookieToken &&
      !isUninitialized &&
      !isFetching &&
      !isSuccess &&
      !token
    ) {
      dispatch(setAuth(null));
      clearCookieToken();
      // clear backup token too, if it exists
      if (backupCookieName) clearBackupCookieToken();
    }
    if (isFetching || appAuthInitialized) return;
    if (!cookieToken) {
      dispatch(setAuth(null));
    } else if (!isSuccess) {
      dispatch(setAuth(null));
    }
  }, [
    isFetching,
    appAuthInitialized,
    cookieToken,
    dispatch,
    isSuccess,
    isUninitialized,
    clearCookieToken,
    backupCookieName,
    clearBackupCookieToken,
    token,
  ]);

  // Set the cookie according to the initialized auth state
  useEffect(() => {
    if (!appAuthInitialized) return;
    if (token && expires) {
      setCookieToken(token, {
        expires: new Date(expires),
        ...(process.env.NODE_ENV === 'development'
          ? {}
          : { domain: `.${process.env.REACT_APP_KBASE_DOMAIN}` }),
      });
    } else if (token && !expires) {
      // eslint-disable-next-line no-console
      console.error('Could not set token cookie, missing expire time');
    } else if (!token) {
      // Auth initialized but theres no valid token? Clear the cookie!
      clearCookieToken();
      // clear backup token too, if it exists
      if (backupCookieName) clearBackupCookieToken();
    }
  }, [
    appAuthInitialized,
    token,
    expires,
    setCookieToken,
    clearCookieToken,
    clearBackupCookieToken,
    backupCookieName,
  ]);

  // If a backup cookie name is specified, set the backup cookie when the token changes
  useEffect(() => {
    if (
      Boolean(backupCookieName) &&
      appAuthInitialized &&
      token &&
      backupCookieToken !== token
    ) {
      if (!expires) {
        // eslint-disable-next-line no-console
        console.error('Could not set backup token cookie, missing expire time');
      } else {
        setBackupCookieToken(token, {
          domain: backupCookieDomain,
          expires: new Date(expires),
        });
      }
    }
  }, [
    backupCookieDomain,
    backupCookieName,
    backupCookieToken,
    expires,
    appAuthInitialized,
    setBackupCookieToken,
    token,
  ]);
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
