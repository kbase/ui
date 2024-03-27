import { useParams } from 'react-router-dom';
import PageNotFound from '../../features/layout/PageNotFound';

/**
 * 404s from the embedded kbase-ui are redirected from
 * legacy.DOMAIN/[some/path/here] to DOMAIN/fallback/[some/path/here].
 *
 * See Routes.tsx for handling of specific routes. A catchall route
 * `/fallback/*` will forward all unhandled fallback routes to this component.
 * Such routes are considered "404s", or unsupported pages.
 */

const FallbackNotFound = () => {
  const params = useParams();
  const path = params['*'];
  return <PageNotFound message={`kbase-ui path "${path}" not found`} />;
};

export default FallbackNotFound;
