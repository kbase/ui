/* App */
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { FC, useEffect } from 'react';

import { isInsideIframe } from '../common';
import { useAppDispatch, useAppSelector } from '../common/hooks';
import { authInitialized, authUsername } from '../features/auth/authSlice';
import LeftNavBar from '../features/layout/LeftNavBar';
import TopBar from '../features/layout/TopBar';
import ErrorPage from '../features/layout/ErrorPage';
import { Loader } from '../common/components/Loader';
import { setEnvironment } from '../features/layout/layoutSlice';
import { ModalDialog } from '../features/layout/Modal';
import { useLoggedInProfileUser } from '../features/profile/profileSlice';
import Routes from './Routes';
import classes from './App.module.scss';
import {
  useInitializeAuthStateFromCookie,
  useSyncAuthStateFromCookie,
  useSyncCookieFromAuthState,
} from '../features/auth/hooks';

const useInitApp = () => {
  const dispatch = useAppDispatch();

  // Only used to bootstrap auth from the auth cookie, if any, present in the browser.
  useInitializeAuthStateFromCookie('kbase_session');

  // Updates app auth state from cookie changes after app startup.
  useSyncAuthStateFromCookie('kbase_session');

  // Ensures the primary auth cookie is set correctly according to app auth state. If a
  // backup cookie is configured, ensures that it mirrors the primary auth cookie.
  useSyncCookieFromAuthState(
    'kbase_session',
    process.env.REACT_APP_KBASE_BACKUP_COOKIE_NAME,
    process.env.REACT_APP_KBASE_BACKUP_COOKIE_DOMAIN
  );

  // Use authenticated username to load user's profile
  const username = useAppSelector(authUsername);
  const initialized = useAppSelector(authInitialized);
  const environment = useAppSelector((state) => state.layout.environment);
  useLoggedInProfileUser(username);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.info('Static Deploy Domain:', process.env.REACT_APP_KBASE_DOMAIN);
    dispatch(setEnvironment(process.env.REACT_APP_KBASE_ENV ?? 'unknown'));
  }, [dispatch, environment]);

  return { isLoading: !initialized };
};

const App: FC = () => {
  const { isLoading } = useInitApp();
  const location = useLocation();
  const fallbackClasses =
    location.pathname.startsWith('/fallback') && isInsideIframe(window)
      ? [classes.fallback]
      : [];
  const classNames = [classes.container, ...fallbackClasses].join(' ');
  return (
    <div className={classNames}>
      <div className={classes.topbar}>
        <TopBar />
      </div>
      <div className={classes.site_content}>
        <div className={classes.left_navbar}>
          <LeftNavBar />
        </div>
        <div className={classes.page_content}>
          <ErrorBoundary FallbackComponent={ErrorPage}>
            <Loader loading={isLoading}>
              <Routes />
            </Loader>
            <Toaster />
            <ModalDialog />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default App;
