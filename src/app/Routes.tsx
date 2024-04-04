import { FC, ReactElement, useEffect } from 'react';
import {
  Navigate,
  Route,
  Routes as RRRoutes,
  useLocation,
} from 'react-router-dom';

import Legacy, { LEGACY_BASE_ROUTE } from '../features/legacy/Legacy';
import { Fallback } from '../features/legacy/IFrameFallback';
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
  useAppDispatch,
  useAppSelector,
  useFilteredParams,
  usePageTracking,
} from '../common/hooks';
import { setLoginControlDisabled } from '../features/layout/layoutSlice';

export const LOGIN_ROUTE = `/${LEGACY_BASE_ROUTE}/login`;
export const ROOT_REDIRECT_ROUTE = '/narratives';

const Routes: FC = () => {
  useFilteredParams();
  usePageTracking();
  return (
    <RRRoutes>
      <Route path={`${LEGACY_BASE_ROUTE}/*`}>
        {/* disable login controls in contexts for which Login is not a viable or recommended action  */}
        <Route path={'login'} element={<DisableLogin element={<Legacy />} />} />
        <Route
          path={`auth2/login/continue`} // Auth2 plugin login continue page
          element={<DisableLogin element={<Legacy />} />}
        />
        <Route path="*" element={<Legacy />} />
      </Route>
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

      {/* IFrame Fallback Routes */}
      <Route path="/fallback">
        <Route
          path="narratives"
          element={<Fallback redirect={() => '/narratives'} />}
        />
        <Route
          path="narrative/:wsId"
          element={
            <Fallback
              reload
              redirect={(params) => `/narrative/${params.wsId}`}
            />
          }
        />
        <Route path="*" element={<Fallback redirect={() => null} />} />
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

export const DisableLogin: FC<{ element: ReactElement }> = ({ element }) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setLoginControlDisabled(true));
    return () => {
      dispatch(setLoginControlDisabled(false));
    };
  }, [dispatch, element]);
  return element;
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
