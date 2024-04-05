/**
 * "Constants" for oft-reused values.
 *
 * They are implemented as functions for ease of test mocking.
 */

// The path prefix for "legacy" paths - paths which should be captured and end up here.
export const LEGACY_BASE_ROUTE = () => {
  return '/legacy';
};

// Constants for oft-reused values or constants we may want to tweak.
export const MONITORING_INTERVAL = () => {
  return 50;
};

/**
 * How long to wait for kbase-ui to issue the `kbase-ui.ready` message from
 * approximately when the iframe (and url invocation of kbase-ui) occurs.
 *
 * After the timeout duration, an error message will be issued, and the request for
 * kbase-ui canceled.
 *
 */
export const CONNECTION_TIMEOUT = () => {
  return 60000;
};

export const CONNECTION_MONITORING_INTERVAL = () => {
  return 100;
};

export const CROSS_DOMAIN_CHANNEL_ID = () => {
  return 'europa_kbaseui_channel';
};
