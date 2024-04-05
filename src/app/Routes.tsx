import { FC, ReactElement } from 'react';
import {
  Navigate,
  Route,
  Routes as RRRoutes,
  useLocation,
} from 'react-router-dom';

import Legacy from '../features/legacy/Legacy';
import Navigator, {
  navigatorPath,
  navigatorPathWithCategory,
} from '../features/navigator/Navigator';
import PageNotFound from '../features/layout/PageNotFound';
import ProfileWrapper from '../features/profile/Profile';
import {
  CollectionsList,
  CollectionDetail,
  detailPath,
  detailDataProductPath,
} from '../features/collections/Collections';
import {
  useAppSelector,
  useFilteredParams,
  usePageTracking,
} from '../common/hooks';
import { LEGACY_BASE_ROUTE } from '../features/legacy/constants';
import FallbackNotFound from '../common/components/FallbackNotFound';

export const LOGIN_ROUTE = `${LEGACY_BASE_ROUTE()}/login`;
export const ROOT_REDIRECT_ROUTE = '/narratives';

const Routes: FC = () => {
  useFilteredParams();
  usePageTracking();
  return (
    <RRRoutes>
      {/* The legacy route without any path element goes to the default location (probably the 
          Narratives Navigator) 
          Note that this replaces the previous behavior, in which the kbase-ui would receive
          an empty path, and issue a navigation to /fallback, which would in turn redirect
          to /narratives. However, this technique is more direct. */}
      <Route
        path={`${LEGACY_BASE_ROUTE()}`}
        element={<Navigate to={ROOT_REDIRECT_ROUTE} replace />}
      />
      {/* Otherwise, legacy routes go to the Legacy component. See the catch-alls at the end for 
          handling of kbase-ui hash routes. */}
      <Route path={`${LEGACY_BASE_ROUTE()}/*`} element={<Legacy />} />
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

      {/* Navigator */}
      <Route
        path={navigatorPath}
        element={<Authed element={<Navigator />} />}
      />
      <Route
        path={'/narratives/:category'}
        element={<Authed element={<Navigator />} />}
      />
      <Route
        path={navigatorPathWithCategory}
        element={<Authed element={<Navigator />} />}
      />
      <Route path="/narratives" element={<Authed element={<Navigator />} />} />

      {/* Collections */}
      <Route path="/collections">
        <Route index element={<Authed element={<CollectionsList />} />} />
        <Route
          path={detailPath}
          element={<Authed element={<CollectionDetail />} />}
        />
        <Route
          path={detailDataProductPath}
          element={<Authed element={<CollectionDetail />} />}
        />
        <Route path="*" element={<PageNotFound />} />
      </Route>

      {/* IFrame Fallback Routes 
        When kbase-ui is called with a hashpath which is not handled, 
        it navigates to 
          `/fallback/{hashpath}?{params}`
        where `{hashpath}` is the original hash path provided to kbase-ui in the iframe
        and   `{params}` is the original params provided as well.

        This can be a way to handle:
        - simple errant urls
        - extant paths in kbase-ui which have been replaced with the equivalent functionality 
          in Europa
      */}
      <Route path="/fallback">
        {/* The fallback issued with no path is equivalent to calling kbase-ui
            with no navigation; this simply cannot happen any longer.
            TODO: try removing the narratives route
         */}
        <Route
          path="narratives"
          element={<Navigate to="/narratives" replace />}
        />

        <Route path="*" element={<FallbackNotFound />} />
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
      <Navigate
        to={`${LEGACY_BASE_ROUTE()}/${location.hash.slice(1)}`}
        replace
      />
    );
  return <Navigate to={ROOT_REDIRECT_ROUTE} replace />;
};

export default Routes;
