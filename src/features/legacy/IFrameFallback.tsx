import { ComponentProps } from 'react';
import { useParams, Navigate, Params } from 'react-router-dom';
import { isInsideIframe } from '../../common';
import PageNotFound from '../layout/PageNotFound';

/**
 * 404s from the legacy site are redirected from legacy.DOMAIN/[some/path/here] to DOMAIN/fallback/[some/path/here]
 * this component handles these fallback redirects as defined in Routes.tsx
 */
export const Fallback = ({
  redirect,
  reload = false,
}: {
  redirect: (
    params: Readonly<Params<string>>
  ) => ComponentProps<typeof Navigate>['to'] | null;
  reload?: boolean;
}) => {
  const params = useParams();
  const to = redirect(params);

  if (window.top && isInsideIframe(window)) {
    // Not in top window, redirect top window to current location
    window.top.location = window.location;
    return <p>Redirecting...</p>;
  } else if (to) {
    if (reload) {
      // redirect is specified and reload is TRUE, perform immediate JS href redirect
      window.location.href = to.toString();
      return <p>Redirecting...</p>;
    } else {
      // redirect is specified and reload is FALSE, render router Navigate redirect
      return <Navigate to={to} />;
    }
  } else {
    return <PageNotFound />;
  }
};
