/* App */
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../common/hooks';
import { authInitialized, authUsername } from '../features/auth/authSlice';
import { useTokenCookie } from '../features/auth/hooks';
import LeftNavBar from '../features/layout/LeftNavBar';
import TopBar from '../features/layout/TopBar';
import ErrorPage from '../features/layout/ErrorPage';
import { Loader } from '../common/components/Loader';
import { setEnvironment } from '../features/layout/layoutSlice';
import { ModalDialog } from '../features/layout/Modal';
import { useLoggedInProfileUser } from '../features/profile/profileSlice';
import Routes from './Routes';
import classes from './App.module.scss';

const useInitApp = () => {
  const dispatch = useAppDispatch();

  // Pulls token from cookie, syncs cookie to auth state
  useTokenCookie('kbase_session');

  // Use authenticated username to load user's profile
  const username = useAppSelector(authUsername);
  const initialized = useAppSelector(authInitialized);
  useLoggedInProfileUser(username);

  // Placeholder code for determining environment.
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.info('Static Deploy Domain:', process.env.REACT_APP_KBASE_DOMAIN);
    dispatch(setEnvironment('ci-europa'));
  }, [dispatch]);

  return { isLoading: !initialized };
};

/*
    <Router basename={process.env.PUBLIC_URL}>
*/
export default function App() {
  const { isLoading } = useInitApp();

  return (
    <Router>
      <div className={classes.container}>
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
    </Router>
  );
}
