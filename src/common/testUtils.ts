// Some commonly used test values
export const WAIT_FOR_TIMEOUT = 1000;
export const WAIT_FOR_INTERVAL = 100;
export const UI_ORIGIN = 'http://localhost';
export const SEND_CHANNEL_ID = 'TEST_SEND_CHANNEL';
export const RECEIVE_CHANNEL_ID = 'TEST_RECEIVE_CHANNEL';

/**
 * Send a window message in the format supported by SendMessage and ReceiveMessage.
 *
 * Useful for sending messages in the format supported by SendMessage and ReceiveMessage.
 *
 * Note that we cannot use postMessage, as jsDOM has bugs with postMessage support.
 * Important for these tests is that the origin is missing.
 * See: https://github.com/jsdom/jsdom/issues/2745
 *
 * @param name The message name
 * @param channel The channel id
 * @param payload The payload, arbitrary
 * @param origin The origin for the recipient window; optional, defaulting to current
 * window origin.
 */
export function sendWindowMessage(
  fromWindow: Window,
  toWindow: Window,
  name: string,
  channel: string,
  payload: unknown,
  options?: SendMessageOptions
) {
  const data = { name, envelope: { channel }, payload };
  // Must use the following, due to jsDOM:
  toWindow.dispatchEvent(
    new MessageEvent('message', {
      source: fromWindow,
      origin: (options && options.targetOrigin) || fromWindow.origin,
      data,
    })
  );
}

export interface SendMessageOptions {
  targetOrigin?: string;
}

/**
 * Returns a function for sending window messages from the given `fromWindow` to the
 * given `toWindow`.
 *
 * Handy in tests involving messages, as each instance of sending a message does not
 * need to bother with specifying the windows.
 *
 * @param fromWindow Window from which the message should be considered sent
 * @param toWindow Window to which the message is directed
 * @returns
 */
export function makeWindowMessageSender(fromWindow: Window, toWindow: Window) {
  return (
    name: string,
    channel: string,
    payload: unknown,
    options?: SendMessageOptions
  ) => {
    sendWindowMessage(fromWindow, toWindow, name, channel, payload, options);
  };
}

/**
 * Sends a window message with arbitrary payload (data).
 *
 * Useful for modeling the sending of invalid messages.
 *
 * @param data The message payload, arbitrary
 * @param origin The origin for the recipient window; optional, no default is provided,
 * so it should adopt the DOM default, which is '/' which indicates same-origin.
 */
export function genericRawPostMessage(data: unknown, origin?: string) {
  window.dispatchEvent(
    new MessageEvent('message', { source: window, origin, data })
  );
}

/**
 * A structure representing all of the supported `process.env` environment variables
 * found in both the development `.env`, the `scripts/build_deploy.sh` build script, and
 * consumed within the Europa codebase.
 */
export interface ProcessEnv {
  domain?: string;
  uiDev?: string;
  legacyDomain?: string;
  legacyBasePath?: string;
  backupCookieName?: string;
  backupCookieDomain?: string;
  commit?: string;
}

/**
 * Sets `process.env` environment variables to allow tests to simulate different
 * configuration scenarios.
 *
 * @param param0 A structure providing properties matching supporte environment
 * variables used to populate the environment variables.
 */
export function setProcessEnv({
  domain,
  uiDev,
  legacyDomain,
  legacyBasePath,
  backupCookieName,
  backupCookieDomain,
  commit,
}: ProcessEnv) {
  process.env.REACT_APP_KBASE_DOMAIN = domain || '';
  process.env.REACT_APP_KBASE_UI_DEV = uiDev || '';
  process.env.REACT_APP_KBASE_LEGACY_DOMAIN = legacyDomain || '';
  process.env.REACT_APP_KBASE_LEGACY_BASE_PATH = legacyBasePath || '';
  process.env.REACT_APP_KBASE_BACKUP_COOKIE_NAME = backupCookieName || '';
  process.env.REACT_APP_KBASE_BACKUP_COOKIE_DOMAIN = backupCookieDomain || '';
  process.env.REACT_APP_COMMIT = commit || '';
}
