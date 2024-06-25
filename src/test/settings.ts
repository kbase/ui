/**
 * Various settings to be used in common between tests that don't have another home.
 */

// We can have a short default timeout, as tests should be running against a
// local server with very low latency.
//
// Of course if you are testing timeout errors, you should ignore this and use
// whatever values are required to trigger whatever conditions are needed.
export const API_CALL_TIMEOUT = 1000;
