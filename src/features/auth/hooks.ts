/* auth/hooks */
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { resetStateAction } from '../../app/store';
import { isLocalDevelopment } from '../../common';
import {
  authFromToken,
  getMe,
  revokeToken,
} from '../../common/api/authService';
import { useCookie } from '../../common/cookie';
import { useAppDispatch, useAppSelector } from '../../common/hooks';
import { authInitialized, authToken, setAuth, setAuthMe } from './authSlice';

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

export type CookieOptions = Parameters<typeof useCookie>[1];

/**
 * Constructs cookie options appropriate for the useCookie hook, based on any options
 * passed in, and the automatically generated domain.
 *
 * Helps avoid the boilerplate of automatically determined options.
 *
 * @param cookieOptions
 * @returns
 */
export function getCookieOptions(
  cookieOptions: CookieOptions = {}
): CookieOptions {
  if (!isLocalDevelopment()) {
    cookieOptions.domain = `${process.env.REACT_APP_KBASE_DOMAIN}`;
  }

  return cookieOptions;
}

/**
 * Ensure a token coming from the untrusted outside world is roughly safe and is of
 * expected types.
 *
 * We don't want to validate the precise form of the token, but just want to establish
 * that it is a nonempty, safe string or null.
 *
 * @param token
 */
export function scrubExternalToken(token: unknown): string | null {
  if (typeof token !== 'string') {
    return null;
  }
  if (token.length > 100) {
    return null;
  }

  if (token.length === 0) {
    return null;
  }

  return token;
}

/**
 * This hook is dedicated to ensuring that the app's authentication state is
 * consistent with the current auth cookie in the browser.
 *
 * It achieves this by launching a query against the auth service to verify the
 * token and fetch associated information, and updating the app state with this
 * information when the query completes.
 *
 * The query is skipped if the token is absent.
 *
 * @param cookieName
 */
export const useInitializeAuthStateFromCookie = (cookieName: string) => {
  const dispatch = useAppDispatch();

  const appAuthInitialized = useAppSelector(authInitialized);

  const cookieOptions = getCookieOptions();

  const [rawCookieToken] = useCookie(cookieName, cookieOptions);

  const cookieToken = scrubExternalToken(rawCookieToken);

  // Pull token, expiration, and init info from auth state
  const currentToken = useAppSelector(authToken) || null;

  const skip = appAuthInitialized || !cookieToken;

  const tokenQuery = authFromToken.useQuery(cookieToken || '', { skip });

  /**
   * Handles the case of a successful token query, in which case the app auth is set
   * from the results.
   *
   * Note that this honors the redux query state flags
   */
  useEffect(() => {
    if (!tokenQuery.isSuccess) return;
    if (tokenQuery.isFetching) return;

    dispatch(
      setAuth({
        // Seems cleaner to take the token from the query args.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        token: tokenQuery.originalArgs!,
        username: tokenQuery.data.user,
        tokenInfo: tokenQuery.data,
      })
    );
  }, [
    // variables
    currentToken,
    cookieToken,
    tokenQuery.originalArgs,
    tokenQuery.data,
    tokenQuery.isSuccess,
    tokenQuery.isFetching,
    // const
    dispatch,
  ]);

  /**
   * Handle case of no cookie token
   */
  useEffect(() => {
    if (cookieToken) return;

    dispatch(setAuth(null));
  }, [
    // volatile
    cookieToken,
    // stable
    dispatch,
  ]);

  /**
   * Handle case of no error in query
   */
  useEffect(() => {
    if (!tokenQuery.isError) return;

    dispatch(setAuth(null));
  }, [
    // volatile
    cookieToken,
    tokenQuery.isError,
    // stable
    dispatch,
  ]);
};

/**
 * Responsible for
 *
 * @param cookieName
 */
export const useSyncAuthStateFromCookie = (cookieName: string) => {
  const dispatch = useAppDispatch();

  const appAuthInitialized = useAppSelector(authInitialized);

  const cookieOptions = getCookieOptions();

  const [rawCookieToken] = useCookie(cookieName, cookieOptions);

  const cookieToken = scrubExternalToken(rawCookieToken);

  const lastCookieRef = useRef(cookieToken);

  const [isCookieChanged, setCookieChanged] = useState<boolean>(false);

  /**
   * Just keeps the last cookie ref updated.
   */
  useEffect(() => {
    if (cookieToken !== lastCookieRef.current) {
      setCookieChanged(true);
      lastCookieRef.current = cookieToken;
    }
  }, [lastCookieRef, cookieToken, setCookieChanged]);

  // Pull token, expiration, and init info from auth state
  const currentToken = useAppSelector(authToken) || null;

  // We only run the token query if the app is initialized, we have a cookie token, and
  // it is different from auth (either a different token, or the app is
  // unauthenticated.)
  // Don't worry, another effect handles the case of a the auth cookie becoming absent.
  const skip =
    !appAuthInitialized || !cookieToken || cookieToken === currentToken;

  const tokenQuery = authFromToken.useQuery(cookieToken || '', { skip });

  /**
   * Handles the case of a successful token query, in which case the app auth is set
   * from the results.
   *
   * Note that this honors the redux query state flags
   */
  useEffect(() => {
    const runEffect =
      appAuthInitialized && tokenQuery.isSuccess && !tokenQuery.isFetching;

    if (!runEffect) return;

    dispatch(
      setAuth({
        // oddly, the token is not returned in the request for token info
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        token: tokenQuery.originalArgs!,
        username: tokenQuery.data.user,
        tokenInfo: tokenQuery.data,
      })
    );
  }, [
    // volatile
    appAuthInitialized,
    isCookieChanged,
    currentToken,
    cookieToken,
    tokenQuery.originalArgs,
    tokenQuery.data,
    tokenQuery.isSuccess,
    tokenQuery.isFetching,
    // stable
    dispatch,
  ]);

  /**
   * Handle case of unsuccessful token query, which case the app auth is removed.
   *
   */
  useEffect(() => {
    const runEffect =
      appAuthInitialized && isCookieChanged && tokenQuery.isError;

    if (!runEffect) return;

    dispatch(setAuth(null));
  }, [
    // volatile
    appAuthInitialized,
    isCookieChanged,
    tokenQuery.isError,
    // stable
    dispatch,
  ]);

  /**
   * Handle case of the cookie token being empty but the app is authenticated,
   * in which case we ensure that the app becomes unauthenticated.
   *
   * Note that in this case the query is also skipped, but afaik there is no status for
   * a skipped query.
   */
  useEffect(() => {
    const runEffect =
      appAuthInitialized && isCookieChanged && !cookieToken && !!currentToken;

    if (!runEffect) return;

    dispatch(setAuth(null));
  }, [
    // volatile
    isCookieChanged,
    cookieToken,
    currentToken,
    appAuthInitialized,
    // stable
    dispatch,
  ]);
};

/**
 * This hook is dedicated to ensuring that browser cookies are synchronized with auth state.
 *
 * Note that each effect handles a single case of the app's auth state.
 *
 * @param cookieName The canonical KBase auth cookie name, aka "kbase_session"
 * @param backupCookieName The canonical KBase backup auth cookie name, aka "kbase_session_backup"
 * @param backupCookieDomain The canonical KBase backup auth cookie domain, aka "kbase.us"
 */
export const useSyncCookieFromAuthState = (
  cookieName: string,
  backupCookieName?: string,
  backupCookieDomain?: string
) => {
  const cookieOptions = getCookieOptions();

  const [, setCookieToken, clearCookieToken] = useCookie(
    cookieName,
    cookieOptions
  );

  // We can omit considering the domain as optional for the backup cookie, as it should
  // not be set in a localhost development scenario.
  const [, setBackupCookieToken, clearBackupCookieToken] = useCookie(
    backupCookieName,
    { domain: backupCookieDomain }
  );

  // Pull token, expiration, and init info from auth state
  const appAuthToken = useAppSelector(authToken);
  const appAuthTokenExpires = useAppSelector(
    ({ auth }) => auth.tokenInfo?.expires
  );
  const appAuthInitialized = useAppSelector(authInitialized);

  /**
   * Set the auth cookie if the app is authenticated.
   */
  useEffect(() => {
    const runEffect = appAuthInitialized && appAuthToken && appAuthTokenExpires;

    if (!runEffect) return;

    const cookieOptions = getCookieOptions({
      expires: new Date(appAuthTokenExpires),
    });

    setCookieToken(appAuthToken, cookieOptions);

    if (backupCookieName) {
      setBackupCookieToken(appAuthToken, {
        domain: backupCookieDomain,
        expires: new Date(appAuthTokenExpires),
      });
    }
  }, [
    // volatile, may change
    appAuthInitialized,
    appAuthToken,
    appAuthTokenExpires,
    // non-volatile, should never change.
    backupCookieName,
    backupCookieDomain,
    setCookieToken,
    setBackupCookieToken,
  ]);

  /**
   * Issue error message to the console if token is set but expires is not.
   *
   * TODO: this isn't a valid use case; if it is, it should do more:
   * - remove app authentication
   * - ensure cookies are absent
   */
  useEffect(() => {
    const runEffect =
      appAuthInitialized && appAuthToken && !appAuthTokenExpires;

    if (!runEffect) return;

    // eslint-disable-next-line no-console
    console.error('Could not set token cookie, missing expire time');
  }, [
    // volatile, may change
    appAuthInitialized,
    appAuthToken,
    appAuthTokenExpires,
  ]);

  /**
   * If token is absent, ensure that the auth and backup auth cookies are absent too.
   */
  useEffect(() => {
    const runEffect = appAuthInitialized && !appAuthToken;

    if (!runEffect) return;

    clearCookieToken();

    if (backupCookieName) {
      clearBackupCookieToken();
    }
  }, [
    // volatile, may change
    appAuthInitialized,
    appAuthToken,
    // non-volatile, should never change.
    backupCookieName,
    clearCookieToken,
    clearBackupCookieToken,
  ]);
};

/**
 * Authentication request state is both sent by the useAuthenticateFromToken hook's
 * setToken function, and the internal state retained.
 */
export interface AuthenticationRequest {
  token: string;
  onAuthResolved: () => void;
}

/**
 * This hook is dedicated to the legacy component setting app authentication state from
 * a token received at the successful conclusion of sign in or sign up.
 *
 * @returns
 */
export const useAuthenticateFromToken = () => {
  const [authenticationRequest, setRequest] =
    useState<AuthenticationRequest | null>(null);

  const dispatch = useAppDispatch();

  const appAuthInitialized = useAppSelector(authInitialized);

  // Don't run in the initial case (empty token).
  // Also, due to the design of useQuery, we must supply an empty string for the initial
  // case in which there is not yet a token (sent by sign in), even though the query is
  // never run.
  const rawToken = authenticationRequest && authenticationRequest.token;

  const token = scrubExternalToken(rawToken);

  const tokenQuery = authFromToken.useQuery(token || '', {
    skip: !token,
  });

  /**
   * Sets the app auth state upon successful completion of the auth request (token query).
   *
   * All other cases are ignored.
   */
  useEffect(() => {
    const runEffect =
      appAuthInitialized &&
      tokenQuery.isSuccess &&
      !tokenQuery.isFetching &&
      authenticationRequest !== null;

    if (!runEffect) return;

    const { onAuthResolved } = authenticationRequest;

    dispatch(
      setAuth({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        token: tokenQuery.originalArgs!,
        username: tokenQuery.data.user,
        tokenInfo: tokenQuery.data,
      })
    );

    onAuthResolved();
  }, [
    // variable
    appAuthInitialized,
    tokenQuery.originalArgs,
    tokenQuery.data,
    tokenQuery.isSuccess,
    tokenQuery.isFetching,
    authenticationRequest,
    // static
    dispatch,
  ]);

  /**
   * This function provided as the output of the hook to be used for submitting a token
   * after sign in.
   */
  const authenticate = useCallback(
    (request: AuthenticationRequest) => {
      setRequest(request);
    },
    [setRequest]
  );

  return { authenticate };
};

/**
 * Given the returned "logout" function, revoke the current authentication.
 *
 * Note that as the logout function is in at least one case (legacy connection) called
 * via an event handler, we use a synchronized token id to ensure it is available when
 * the function is called outside of a hook, effect, or component context.
 *
 * @returns
 */
export const useLogout = () => {
  const tokenId = useAppSelector(({ auth }) => auth.tokenInfo?.id);
  const tokenIdRef = useRef(tokenId);

  // Synchronizes the token id ref
  useEffect(() => {
    tokenIdRef.current = tokenId;
  }, [tokenId]);

  const [revoke] = revokeToken.useMutation();
  const dispatch = useAppDispatch();

  const logout = useCallback(() => {
    if (!tokenIdRef.current) return;

    revoke(tokenIdRef.current)
      .unwrap()
      .then(() => {
        dispatch(resetStateAction());
        // setAuth(null) follow the state reset to initialize the page as un-Authed
        dispatch(setAuth(null));
        toast('You have been signed out');
      })
      .catch((ex) => {
        // Handles the case of double-invocation, which can occur with strict mode.
        if (tokenIdRef.current) {
          // eslint-disable-next-line no-console
          console.error('Cannot log out', ex);
          toast('Error, could not log out.');
        }
      });
  }, [
    // stable
    revoke,
    dispatch,
  ]);

  return logout;
};
