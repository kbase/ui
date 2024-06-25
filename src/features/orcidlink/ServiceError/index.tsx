/**
 * Entrypoint, or "controller", for the ServicError component.
 *
 * As with most other components in the orcidlink feature, we use an
 * intermediary component to interface with the system to the extent we can.
 * This component looks for parameters expected from the url and provides
 * default values.
 *
 * It then invokes the "view" component with these parameter values.
 *
 * What is a service error? During the oauth flow, it is possible for the
 * service to encounter an error. During the oauth flow we are not using the JSON-RPC
 * api, but rather a interactive browser navigation. An error is handled by
 * redirecting to this endpoint, with the error code and message. This, then, is
 * simply displayed here.
 *
 * TODO: this is a placeholder for the final implementation, which will call the
 * orcidlink to obtain the definition of the error, given the code.
 */
import { useSearchParams } from 'react-router-dom';
import ORCIDLinkServiceErrorView from './view';

export default function ORCIDLinkServiceErrorController() {
  const [searchParams] = useSearchParams();

  const code = searchParams.get('code') || 'n/a';
  const message = searchParams.get('message') || 'n/a';

  return <ORCIDLinkServiceErrorView code={code} message={message} />;
}
