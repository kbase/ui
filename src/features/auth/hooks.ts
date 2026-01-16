/* auth/hooks */
import { useEffect, useRef } from 'react';
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
  const authAPIQuery = getMe.useQuery({ token }, { skip: !token });
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

  // Pull current token, expiration, and init info from auth state
  const currentToken = useAppSelector(authToken);
  const currentExpires = useAppSelector(({ auth }) => auth.tokenInfo?.expires);
  const initialized = useAppSelector(authInitialized); // true after setAuth is called.

  // Pull token from main cookie. If it exists, and differs from state, try it for auth.
  const cookieOptions = {
    ...(import.meta.env.MODE === 'development'
      ? {}
      : { domain: `.${import.meta.env.VITE_KBASE_DOMAIN}` }),
    path: '/',
    secure: true,
  };
  const [cookieToken, setCookieToken, clearCookieToken] = useCookie(
    cookieName,
    cookieOptions
  );

  // Controls for backupCookie
  const [backupCookieToken, setBackupCookieToken, clearBackupCookieToken] =
    useCookie(backupCookieName, {
      ...cookieOptions,
      domain: backupCookieDomain,
    });

  // On cookie token change, validate. If valid, set auth.
  const { isError, isFetching } = useTryAuthFromToken(
    cookieToken || backupCookieToken
  );

  // Initializes auth when useTryAuthFromToken fails or doesn't run.
  useEffect(() => {
    if (initialized) {
      return;
    } else if (!(cookieToken || backupCookieToken)) {
      // If there is no cookieToken, init auth as null
      dispatch(setAuth(null));
    } else if (
      !isFetching && // The request finished
      isError && // it failed
      !currentToken // and we don't have a token in state
    ) {
      // init auth as null.
      dispatch(setAuth(null));
      // Clear the bad cookie
      clearCookieToken();
      // Clear backup token too, if it exists
      if (backupCookieName) clearBackupCookieToken();
    }
  }, [
    isFetching,
    initialized,
    cookieToken,
    dispatch,
    clearCookieToken,
    backupCookieName,
    clearBackupCookieToken,
    currentToken,
    isError,
    backupCookieToken,
  ]);

  // Set the cookie according to the initialized auth state
  useEffect(() => {
    if (!initialized) return;
    if (currentToken && currentExpires) {
      setCookieToken(currentToken, {
        expires: new Date(currentExpires),
      });
    } else if (currentToken && !currentExpires) {
      // eslint-disable-next-line no-console
      console.error('Could not set token cookie, missing expire time');
    } else if (!currentToken) {
      // Auth initialized but theres no valid token? Clear the cookie!
      clearCookieToken();
      // clear backup token too, if it exists
      if (backupCookieName) clearBackupCookieToken();
    }
  }, [
    initialized,
    currentToken,
    currentExpires,
    setCookieToken,
    clearCookieToken,
    clearBackupCookieToken,
    backupCookieName,
  ]);

  // If a backup cookie name is specified, set the backup cookie when the token changes
  useEffect(() => {
    if (
      Boolean(backupCookieName) &&
      Boolean(backupCookieDomain) &&
      initialized &&
      currentToken &&
      backupCookieToken !== currentToken
    ) {
      if (!currentExpires) {
        // eslint-disable-next-line no-console
        console.error('Could not set backup token cookie, missing expire time');
      } else {
        setBackupCookieToken(currentToken, {
          expires: new Date(currentExpires),
        });
      }
    } else if (
      (Boolean(backupCookieName) || Boolean(backupCookieDomain)) &&
      (!backupCookieDomain || !backupCookieName)
    ) {
      // eslint-disable-next-line no-console
      console.error('Backup cookie cannot be set due to bad configuration.');
    }
  }, [
    backupCookieDomain,
    backupCookieName,
    backupCookieToken,
    currentExpires,
    initialized,
    setBackupCookieToken,
    currentToken,
  ]);
};

export const useTryAuthFromToken = (token?: string) => {
  const dispatch = useAppDispatch();
  const normToken = normalizeToken(token, '');

  const tokenQuery = authFromToken.useQuery(normToken, {
    skip: !normToken,
  });

  // Make ref for currentToken as we want to exclude it from effect deps
  const currentToken = useAppSelector(authToken);
  const currentTokenRef = useRef(currentToken);
  currentTokenRef.current = currentToken;

  // Set auth state when token is valid
  useEffect(() => {
    if (tokenQuery.isSuccess && normToken !== currentTokenRef.current) {
      dispatch(
        setAuth({
          token: normToken,
          username: tokenQuery.data.user,
          tokenInfo: tokenQuery.data,
        })
      );
    }
  }, [normToken, tokenQuery.data, tokenQuery.isSuccess, dispatch]);

  return tokenQuery;
};
