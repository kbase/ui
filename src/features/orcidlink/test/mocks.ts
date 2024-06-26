import ORCIDLinkAPI from '../common/api/ORCIDLInkAPI';
import { ORCIDLINK_SERVICE_API_ENDPOINT } from '../constants';
import { API_CALL_TIMEOUT } from './data';

/**
 * A convienence function to make an orcidlink service endpoint for tests.
 *
 * Note that the service endpoint should be computed
 */
export function makeORCIDLinkAPI(): ORCIDLinkAPI {
  return new ORCIDLinkAPI({
    timeout: API_CALL_TIMEOUT,
    url: ORCIDLINK_SERVICE_API_ENDPOINT,
  });
}
