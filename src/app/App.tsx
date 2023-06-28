import classes from './App.module.scss';

import { BrowserRouter as Router } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../common/hooks';
import { useEffect } from 'react';
import { setEnvironment } from '../features/layout/layoutSlice';
import {
  authInitialized,
  authUsername,
  useTokenCookie,
} from '../features/auth/authSlice';
import { useLoggedInProfileUser } from '../features/profile/profileSlice';
import { ErrorBoundary } from 'react-error-boundary';

import Routes from './Routes';
import LeftNavBar from '../features/layout/LeftNavBar';
import TopBar from '../features/layout/TopBar';
import ErrorPage from '../features/layout/ErrorPage';

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

export default function App() {
  const { isLoading } = useInitApp();

  return (
    <Router basename={process.env.PUBLIC_URL}>
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
              {isLoading ? 'Loading...' : <Routes />}
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </Router>
  );
}
