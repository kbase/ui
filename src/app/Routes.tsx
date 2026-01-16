import { FC, ReactElement } from 'react';
import {
  createSearchParams,
  Navigate,
  Route,
  Routes as RRRoutes,
  useLocation,
} from 'react-router-dom';
import {
  CollectionsList,
  CollectionDetail,
  detailPath,
  detailDataProductPath,
} from '../features/collections/Collections';
import Legacy from '../features/legacy/Legacy';
import { Fallback } from '../features/legacy/IFrameFallback';
import Navigator, {
  navigatorPath,
  navigatorPathWithCategory,
} from '../features/navigator/Navigator';
import PageNotFound from '../features/layout/PageNotFound';
import ProfileWrapper from '../features/profile/Profile';
import Status from '../features/status/Status';
import {
  useAppSelector,
  useFilteredParams,
  usePageTracking,
} from '../common/hooks';
import { LogIn } from '../features/login/LogIn';
import { LogInContinue } from '../features/login/LogInContinue';
import { LoggedOut } from '../features/login/LoggedOut';
import { Logout } from '../features/login/Logout';
import { SignUp } from '../features/signup/SignUp';
import { Account } from '../features/account/Account';
import { AccountInfo } from '../features/account/AccountInfo';
import { LinkedProviders } from '../features/account/LinkedProviders';
import { LogInSessions } from '../features/account/LogInSessions';
import { UseAgreements } from '../features/account/UseAgreements';
import { skipToken } from '@reduxjs/toolkit/query';
import { getMe } from '../common/api/authService';
import { CDMRedirect } from '../features/cdm/CDMRedirect';
import {
  OrcidLink,
  OrcidLinkContinue,
  OrcidLinkStatus,
  OrcidLinkError,
} from '../features/account/OrcidLink';
import { ManageTokens } from '../features/account/ManageTokens';
import {
  LOGIN_ROUTE,
  SIGNUP_ROUTE,
  ROOT_REDIRECT_ROUTE,
  LEGACY_BASE_ROUTE,
} from './routes.constants';

// Re-export for backwards compatibility
export {
  LOGIN_ROUTE,
  SIGNUP_ROUTE,
  ROOT_REDIRECT_ROUTE,
} from './routes.constants';

const Routes: FC = () => {
  useFilteredParams();
  usePageTracking();
  return (
    <RRRoutes>
      {/* Legacy */}
      <Route path={`${LEGACY_BASE_ROUTE}/*`} element={<Legacy />} />

      <Route path="/status" element={<Status />} />
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

      {/* Log In */}
      <Route path="/login" element={<LogIn />} />
      <Route path="/login/continue" element={<LogInContinue />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/loggedout" element={<LoggedOut />} />

      {/* Sign Up */}
      <Route path={`${SIGNUP_ROUTE}/:step?`} element={<SignUp />} />

      {/* Account */}
      <Route path="/account" element={<Authed element={<Account />} />}>
        <Route index element={<Authed element={<AccountInfo />} />} />
        <Route path="info" element={<Authed element={<AccountInfo />} />} />
        <Route
          path="providers"
          element={<Authed element={<LinkedProviders />} />}
        />
        <Route
          path="providers/link/continue"
          element={<Authed element={<LinkedProviders isContinueRoute />} />}
        />
        <Route
          path="sessions"
          element={<Authed element={<LogInSessions />} />}
        />
        <Route
          path="use-agreements"
          element={<Authed element={<UseAgreements />} />}
        />
        <Route path="orcidlink" element={<Authed element={<OrcidLink />} />}>
          <Route index element={<OrcidLinkStatus />} />
          <Route path="continue/error" element={<OrcidLinkError />} />
          <Route path="continue/:sessionId" element={<OrcidLinkContinue />} />
        </Route>
        <Route
          path="service-tokens"
          element={<Authed element={<ManageTokens type={'service'} />} />}
        />
        <Route
          path="dev-tokens"
          element={<Authed element={<ManageTokens type={'developer'} />} />}
        />
      </Route>

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

      {/* CDM */}
      <Route path="/cdm">
        <Route path="redirect" element={<Authed element={<CDMRedirect />} />} />
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

export const Authed: FC<{ element: ReactElement; roles?: string[] }> = ({
  element,
  roles,
}) => {
  const token = useAppSelector((state) => state.auth.token);
  const location = useLocation();

  const { data: me } = getMe.useQuery(token ? { token } : skipToken);
  const myRoles = new Set([
    ...(me?.roles.map((r) => r.id) || []),
    ...(me?.customroles || []),
  ]);
  const specifiedRolesPresent =
    roles?.length && roles.every((role) => myRoles.has(role));

  if (!token) {
    return (
      <Navigate
        to={{
          pathname: LOGIN_ROUTE,
          search: createSearchParams({
            nextRequest: JSON.stringify(location),
          }).toString(),
        }}
        replace
      />
    );
  }

  if (roles && !specifiedRolesPresent) {
    return <PageNotFound />;
  }

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
