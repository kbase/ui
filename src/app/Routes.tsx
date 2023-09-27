import { FC, ReactElement } from 'react';
import {
  Navigate,
  Route,
  Routes as RRRoutes,
  useLocation,
  useSearchParams,
} from 'react-router-dom';

import Auth from '../features/auth/Auth';
import Count from '../features/count/Counter';
import Legacy, { LEGACY_BASE_ROUTE } from '../features/legacy/Legacy';
import { PUBLIC_URL } from './Routes.common';
import Navigator from '../features/navigator/Navigator';
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
export const ROOT_REDIRECT_ROUTE = `/narratives`;

const LoadNarrative: FC = () => {
  const [searchParams] = useSearchParams();
  const { n: wsIdRaw } = Object.fromEntries(searchParams.entries());
  const wsId = Number(wsIdRaw);
  return <>Load Narrative: {wsId}</>;
};

const Routes: FC = () => {
  useFilteredParams();
  return (
    <RRRoutes>
      <Route path="load-narrative.html" element={<LoadNarrative />} />
      <Route path={`${PUBLIC_URL}`}>
        <Route path={`${LEGACY_BASE_ROUTE.slice(1)}/*`} element={<Legacy />} />
        <Route
          path="profile/:usernameRequested/narratives"
          element={<Authed element={<ProfileWrapper />} />}
        />
        <Route
          path="profile/:usernameRequested"
          element={<Authed element={<ProfileWrapper />} />}
        />
        <Route
          path="profile"
          element={<Authed element={<ProfileWrapper />} />}
        />
        <Route path="count" element={<Authed element={<Count />} />} />
        <Route path="auth" element={<Auth />} />

        {/* Navigator */}
        <Route path={'narratives'}>
          <Route
            path={':id/:obj/:ver'}
            element={<Authed element={<Navigator />} />}
          />
          <Route
            path={':category'}
            element={<Authed element={<Navigator />} />}
          />
          <Route
            path={':category/:id/:obj/:ver'}
            element={<Authed element={<Navigator />} />}
          />
          <Route path="" element={<Authed element={<Navigator />} />} />
          <Route path="*" element={<Navigate to={''} replace />} />
        </Route>

        {/* Collections */}
        <Route path="collections">
          <Route index element={<CollectionsList />} />
          <Route path={detailPath} element={<CollectionDetail />} />
          <Route path={detailDataProductPath} element={<CollectionDetail />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
        <Route path="" element={<HashRouteRedirect />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
      <Route path="*" element={<Navigate to={PUBLIC_URL} replace />} />
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
  return <Navigate to={ROOT_REDIRECT_ROUTE.slice(1)} replace />;
};

export default Routes;
