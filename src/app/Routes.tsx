import { FC, ReactElement } from 'react';
import {
  Navigate,
  Route,
  Routes as RRRoutes,
  useLocation,
} from 'react-router-dom';

import Auth from '../features/auth/Auth';
import Count from '../features/count/Counter';
import Legacy, { LEGACY_BASE_ROUTE } from '../features/legacy/Legacy';
import Navigator, {
  narrativeSelectedPath,
  narrativeSelectedPathWithCategory,
} from '../features/navigator/Navigator';
import PageNotFound from '../features/layout/PageNotFound';
import ProfileWrapper from '../features/profile/Profile';
import {
  CollectionsList,
  CollectionDetail,
  detailPath,
  detailDataProductPath,
} from '../features/collections/Collections';
import { useAppSelector, useFilteredParams } from '../common/hooks';

export const LOGIN_ROUTE = '/legacy/login';
export const ROOT_REDIRECT_ROUTE = '/narratives';

const Routes: FC = () => {
  useFilteredParams();
  return (
    <RRRoutes>
      <Route path={`${LEGACY_BASE_ROUTE}/*`} element={<Legacy />} />
      <Route
        path="/profile/:usernameRequested/narratives"
        element={<Authed element={<ProfileWrapper />} />}
      />
      <Route
        path="/profile/:usernameRequested"
        element={<Authed element={<ProfileWrapper />} />}
      />
      <Route
        path="/profile"
        element={<Authed element={<ProfileWrapper />} />}
      />
      <Route path="/count" element={<Authed element={<Count />} />} />
      <Route path="/auth" element={<Auth />} />

      {/* Navigator */}
      <Route
        path={narrativeSelectedPath}
        element={<Authed element={<Navigator />} />}
      />
      <Route
        path={'/narratives/:category'}
        element={<Authed element={<Navigator />} />}
      />
      <Route
        path={narrativeSelectedPathWithCategory}
        element={<Authed element={<Navigator />} />}
      />
      <Route path="/narratives" element={<Authed element={<Navigator />} />} />

      {/* Collections */}
      <Route path="/collections">
        <Route index element={<CollectionsList />} />
        <Route path={detailPath} element={<CollectionDetail />} />
        <Route path={detailDataProductPath} element={<CollectionDetail />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>

      <Route path="/" element={<HashRouteRedirect />} />
      <Route path="*" element={<PageNotFound />} />
    </RRRoutes>
  );
};

export const Authed: FC<{ element: ReactElement }> = ({ element }) => {
  const token = useAppSelector((state) => state.auth.token);
  const location = useLocation();
  if (!token)
    return (
      <Navigate
        to={LOGIN_ROUTE}
        replace
        state={{ preLoginPath: location.pathname }}
      />
    );

  return <>{element}</>;
};

export const HashRouteRedirect = () => {
  const location = useLocation();
  if (location.hash)
    return (
      <Navigate to={`${LEGACY_BASE_ROUTE}/${location.hash.slice(1)}`} replace />
    );
  return <Navigate to={ROOT_REDIRECT_ROUTE} replace />;
};

export default Routes;
