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
 * How long to wait until we warn the user that loading is taking longer than expected,
 * and show them more detail (e.g. countdown timer).
 *
 * @returns Connection timeout delay in milliseconds
 */
export const CONNECTION_TIMEOUT_DELAY = () => {
  return 5000;
};

/**
 * How long to wait for kbase-ui to issue the `kbase-ui.ready` message from
 * approximately when the iframe (and url invocation of kbase-ui) occurs.
 *
 * After the timeout duration, an error message will be issued, and the request for
 * kbase-ui canceled.
 *
 * @returns Connection timeout in milliseconds
 */
export const CONNECTION_TIMEOUT = () => {
  return 60000;
};

export const CONNECTION_MONITORING_INTERVAL = () => {
  return 100;
};
