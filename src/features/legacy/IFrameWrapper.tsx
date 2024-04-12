import { faExclamation, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, AlertTitle, Box, Grow, Typography } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingOverlay from '../../common/components/OverlayContainer';
import {
  CONNECTION_MONITORING_INTERVAL,
  CONNECTION_TIMEOUT,
  CONNECTION_TIMEOUT_DELAY,
} from './constants';
import CountdownClock from './CountdownClock';
import classes from './IFrameWrapper.module.scss';
import KBaseUIConnection from './KBaseUIConnection';
import { KBaseUIRedirectPayload } from './messageValidation';
import TimeoutMonitor, { TimeoutMonitorStateRunning } from './TimeoutMonitor';
import { areParamsEqual, parseLegacyURL } from './utils';

export interface OnLoggedInParams {
  token: string;
  expires: number;
  onAuthResolved: () => void;
}

/**
 * Props for the iframe wrapper component.
 */
export interface IFrameWrapperProps {
  /** The unique channel id for the send and receive channels. It could be generated
   * here as a uuid, but it provs useful, in testing at least, to be able to supply it*/
  sendChannelId: string;
  receiveChannelId: string;

  /** The url to kbase-ui. It should be in the form expected by kbase-ui
   * TODO: document the required form!
   */
  legacyURL: URL;

  /** The url present in the browser when the legacy component was mounted. */
  legacyPath: LegacyPath;

  /** The kbase auth token, if any, currently active in Europa */
  token: string | null;

  /** Spy on sent messages; useful for debugging */
  spyOnChannels?: boolean;

  /** Sets the page title for the UI and the brower; called when kbase-ui.set-title is received */
  setTitle: (title: string) => void;

  /**  */
  onLoggedIn: (payload: OnLoggedInParams) => void;

  /**  */
  onLogOut: () => void;
}

/**
 * Captures all recognized states of the iframe wrapper component
 *
 * NONE - initial state
 * CONNECTING - actively engaged in creating a connection to kbase-ui
 * INITIALIZING - actively initializing kbase-ui through the connection
 * CONNECTED - connection to kbase-ui established and initialized; normal operating state.
 * ERROR - some error occurred while connecting
 *
 * The resulting interface "IFrameWrapperState" uses the "diamond" definition pattern
 * I've found very useful for discriminated-union enabled structures.
 *
 * The "status" property is the discriminiator, and in this case represents the identity
 * of the "state".
 *
 * Then we define an interface for each state. Define properties for information
 * associated with that state.
 *
 * Then, ultimately, we create a single type out of the union of all the "state"
 * interfaces. Because we have defined a state interface for each "status" enum value.
 * Thus, when we, say, perform some rendering operation as a function of the state, we
 * can use a switch..case to close over all possible states.
 */
export enum IFrameWrapperStatus {
  NONE = 'NONE',
  CONNECT = 'CONNECT',
  CONNECTING = 'CONNECTING',
  INITIALIZING = 'INITIALIZING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export interface IFrameWrapperStatBase {
  status: IFrameWrapperStatus;
}

export interface IFrameWrapperStateNone extends IFrameWrapperStatBase {
  status: IFrameWrapperStatus.NONE;
}

export interface IFrameWrapperStateConnecting extends IFrameWrapperStatBase {
  status: IFrameWrapperStatus.CONNECTING;
  connection: KBaseUIConnection;
  limit: number;
  elapsed: number;
}

export interface IFrameWrapperStateInitializing extends IFrameWrapperStatBase {
  status: IFrameWrapperStatus.INITIALIZING;
  connection: KBaseUIConnection;
}

export interface IFrameWrapperStateConnected extends IFrameWrapperStatBase {
  status: IFrameWrapperStatus.CONNECTED;
  connection: KBaseUIConnection;
}

export interface IFrameWrapperStateError extends IFrameWrapperStatBase {
  status: IFrameWrapperStatus.ERROR;
  message: string;
}

export type IFrameWrapperState =
  | IFrameWrapperStateNone
  | IFrameWrapperStateConnecting
  | IFrameWrapperStateInitializing
  | IFrameWrapperStateConnected
  | IFrameWrapperStateError;

export interface LegacyPath {
  path: string;
  params?: Record<string, string>;
}

export default function IFrameWrapper({
  sendChannelId,
  receiveChannelId,
  legacyURL,
  legacyPath,
  token,
  setTitle,
  onLoggedIn,
  onLogOut,
  spyOnChannels,
}: IFrameWrapperProps) {
  // Overall state here is used to track progress of the connection, and hide until it
  // is ready.
  const [state, setState] = useState<IFrameWrapperState>({
    status: IFrameWrapperStatus.NONE,
  });

  const legacyContentRef = useRef<HTMLIFrameElement>(null);

  const navigate = useNavigate();

  const location = useLocation();

  /**
   * Create and set up the connection to kbase-ui.
   * Only set the connection state property after everything is finished.
   * That way we don't end up with the connection being used before it is ready...
   */

  function onRedirect({ url }: KBaseUIRedirectPayload): void {
    window.open(url, '_self');
  }

  function onLostConnection(message: string) {
    setState({
      status: IFrameWrapperStatus.ERROR,
      message: message,
    });
  }

  const syncedState = useRef<IFrameWrapperState>(state);
  syncedState.current = state;

  /**
   * This effect is dedicated to creating the initial connection.
   *
   * It transitions from NONE, the initial state, to CONNECTING.
   *
   * Its jobs is to create the connection, and pass it to the CONNECTING state.
   */
  useEffect(() => {
    if (state.status !== IFrameWrapperStatus.NONE) {
      return;
    }

    // Should never occur, but required for type narrowing, so let us honor it for what
    // it is.
    if (!legacyContentRef.current || !legacyContentRef.current.contentWindow) {
      return;
    }

    const connection = new KBaseUIConnection({
      kbaseUIWindow: legacyContentRef.current.contentWindow,
      kbaseUIOrigin: legacyURL.origin,
      spyOnChannels,
      sendChannelId,
      receiveChannelId,
    });

    setState({
      status: IFrameWrapperStatus.CONNECTING,
      connection,
      limit: CONNECTION_TIMEOUT(),
      elapsed: 0,
    });
  }, [
    state,
    legacyURL,
    spyOnChannels,
    setState,
    sendChannelId,
    receiveChannelId,
  ]);

  /**
   * This effect is dedicated to CONNECTING to kbase-ui.
   *
   * The connection code should only be run once, so we use a gatekeeper ref for that
   * purpose. However, the effect is run may times during the CONNECTING phase, as it
   * continually updates the CONNECTING state to reflect the timeout monitor's countdown
   * torards timing out.
   */

  // Used as a gatekeeper so that we only execute the connection process the first time
  // we enter CONNECTING state.
  const connectingRef = useRef<boolean>(false);

  useEffect(() => {
    if (state.status !== IFrameWrapperStatus.CONNECTING) {
      return;
    }

    const doConnect = async () => {
      const connection = state.connection;
      connectingRef.current = true;

      let monitor: TimeoutMonitor | null = null;
      try {
        // We use a countdown timer, which will set the state to error if
        // it is allowed to complete.
        monitor = new TimeoutMonitor({
          timeout: CONNECTION_TIMEOUT(),
          interval: CONNECTION_MONITORING_INTERVAL(),
          onTimeout: (elapsed: number) => {
            // connection.current && connection.current.disconnect();
            connection.disconnect();
            setState({
              status: IFrameWrapperStatus.ERROR,
              message: `Connection to kbase-ui timed out after ${elapsed}ms`,
            });
          },
          onInterval: (state: TimeoutMonitorStateRunning) => {
            setState({
              status: IFrameWrapperStatus.CONNECTING,
              connection,
              limit: CONNECTION_TIMEOUT(),
              elapsed: state.elapsed,
            });
          },
        });
        monitor.start();

        // await connectionRef.current.connect();
        await connection.connect(CONNECTION_TIMEOUT());

        // So we stop the clock as soon as we are connected.
        monitor.stop();

        setState({ status: IFrameWrapperStatus.INITIALIZING, connection });
      } catch (ex) {
        setState({
          status: IFrameWrapperStatus.ERROR,
          message: ex instanceof Error ? ex.message : 'Unknown Error',
        });
      } finally {
        // Just to make sure, doesn't hurt.
        if (monitor) {
          monitor.stop();
        }
      }
    };

    // We only set the connection in component state once it is fully complete.
    // NB we need to use old-style promise chaining for useEffect.
    if (!connectingRef.current) {
      doConnect().catch((ex) => {
        setState({
          status: IFrameWrapperStatus.ERROR,
          message: ex instanceof Error ? ex.message : 'Unknown Error',
        });
      });
    }
  }, [state]);

  /**
   * Dedicated to the INITIALIZING state.
   *
   * This state is just temporary, and exists to start the connection and perform the
   * initial navigation and authentication.
   *
   */
  useEffect(() => {
    if (state.status !== IFrameWrapperStatus.INITIALIZING) {
      return;
    }

    const connection = state.connection;

    connection.start({
      navigate,
      setTitle,
      onLoggedIn,
      onLogOut,
      onRedirect,
      onLostConnection,
    });

    connection.authnavigate(token || null, legacyPath);

    setState({ status: IFrameWrapperStatus.CONNECTED, connection });
  }, [
    // dynamic
    state,
    legacyPath,
    token,
    // static
    navigate,
    setTitle,
    onLoggedIn,
    onLogOut,
    setState,
  ]);

  /**
   * Just sets the title, based on the current state of loading kbase-ui.
   *
   * After kbase-ui is loaded, it will take over setting the app title.
   */
  useEffect(() => {
    const title = (() => {
      switch (state.status) {
        case IFrameWrapperStatus.NONE:
        case IFrameWrapperStatus.CONNECTING:
          return 'Loading App';
        case IFrameWrapperStatus.ERROR:
          return 'Error';
      }
    })();
    if (title) {
      setTitle(title);
    }
  }, [state, setTitle]);

  /**
   * This effect dedicated to the CONNECTED state and changes to the location - navigation.
   *
   * It provides most of the runtime  monitoring the current location for changes in the url
   * which would cause a navigation in kbase-ui.
   *
   * If such a change is detected, the "navigate" connection method is called, which
   * sends a "europa.navigate" message to kbase-ui.
   */

  const parseLegacyPathFromURL = useCallback(
    (url: URL) => {
      // const url = new URL(window.location.origin);
      url.pathname = location.pathname;
      new URLSearchParams(location.search).forEach((value, key) => {
        url.searchParams.set(key, value);
      });

      return parseLegacyURL(url);
    },
    [location]
  );

  const url = new URL(window.location.origin);
  const initialLegacyPath = parseLegacyPathFromURL(url);
  const previousLegacyPathRef = useRef<LegacyPath>(initialLegacyPath);

  useEffect(() => {
    if (state.status !== IFrameWrapperStatus.CONNECTED) {
      return;
    }
    // Generate the legacy path from the current window location.
    const url = new URL(window.location.origin);
    const { path, params } = parseLegacyPathFromURL(url);

    // Handle transition from one location to another (i.e. navigation)
    if (
      previousLegacyPathRef.current === null ||
      previousLegacyPathRef.current.path !== path ||
      !areParamsEqual(previousLegacyPathRef.current.params, params)
    ) {
      previousLegacyPathRef.current = { path, params };
      state.connection.navigate(path, params);
    }
  }, [location, state, parseLegacyPathFromURL]);

  /**
   * This effect dedicated to CONNECTED state and token change.
   *
   * It monitors auth state for changes and sends the appropriate message to kbase-ui.
   */
  const previousTokenRef = useRef(token);
  useEffect(() => {
    if (state.status !== IFrameWrapperStatus.CONNECTED) {
      return;
    }
    const previousToken = previousTokenRef.current;
    previousTokenRef.current = token;

    // Handle transition from unauthenticated to authenticated.
    if (previousToken === null) {
      if (token !== null) {
        // Note no next request, as this is from the side effect of authentication
        // happening outside of this session - e.g. logging in in a different window.
        state.connection.authenticated(token);
      }
    } else if (token === null) {
      // Handle transition from authenticated to unauthenticated.
      state.connection.deauthenticated();
    }
  }, [token, state, previousTokenRef]);

  /**
   * This effect is dedicated to the CONNECTED state and exists in order to properly
   * arrange the connection cleanup upon dismount.
   *
   * It works becomes the state is only updated once upon entering CONNECTED state, and
   * thus the cleanup only runs once.
   */
  useEffect(() => {
    if (state.status !== IFrameWrapperStatus.CONNECTED) {
      return;
    }

    return () => {
      state.connection.disconnect();
    };
  }, [state]);

  /**
   * Renders a "loading overlay" - an absolutely positioned element stretching across
   * it's container, and obscuring what is happening "underneath". The purppose is to
   * provide a loading indicator, even as kbase-ui is loading underneath.
   *
   * It is enabled during "NONE" or "CONNECTING" state, and disabled upon "ERROR" or "CONNECTED".
   *
   * @param state
   * @returns
   */
  function renderLoadingOverlay(state: IFrameWrapperState) {
    if (state.status === IFrameWrapperStatus.CONNECTED) {
      return;
    }

    const title = (() => {
      switch (state.status) {
        case IFrameWrapperStatus.NONE:
        case IFrameWrapperStatus.CONNECTING:
          return 'Loading App';
        case IFrameWrapperStatus.ERROR:
          return 'Error';
      }
    })();

    const loadingMessage = (() => {
      switch (state.status) {
        case IFrameWrapperStatus.NONE:
          return (
            <span>
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                size="lg"
                color="orange"
                style={{ marginRight: '0.5rem' }}
              />
              Connecting...
            </span>
          );
        case IFrameWrapperStatus.CONNECTING:
          return (
            <div>
              <div>
                <FontAwesomeIcon
                  icon={faSpinner}
                  spin
                  size="lg"
                  color="orange"
                  style={{ marginRight: '0.5rem' }}
                />
                Connecting...
              </div>
              <div>
                <Grow
                  in={state.elapsed > CONNECTION_TIMEOUT_DELAY()}
                  unmountOnExit
                >
                  <div>
                    <Box mt={2}>
                      <CountdownClock
                        elapsed={CONNECTION_TIMEOUT_DELAY()}
                        duration={state.limit}
                        interval={100}
                      />
                    </Box>
                    {/* <hr /> */}
                    <Typography style={{ fontStyle: 'italic' }} mt={2}>
                      This is taking longer than expected.
                    </Typography>
                    <Typography style={{ fontStyle: 'italic' }} mt={2}>
                      We'll continue waiting{' '}
                      {Intl.NumberFormat('en-US', {}).format(
                        state.limit / 1000
                      )}{' '}
                      seconds for load to complete.
                    </Typography>
                    <Typography style={{ fontStyle: 'italic' }} mt={2}>
                      You may try to reload the browser any time, in case it is
                      due to a temporary outage or slowdown.
                    </Typography>
                    <Typography
                      style={{ fontWeight: 'bold', textAlign: 'center' }}
                      mt={2}
                    ></Typography>
                  </div>
                </Grow>
              </div>
            </div>
          );
        case IFrameWrapperStatus.ERROR:
          return (
            <span>
              <p>An error ocurred connecting to kbase-ui.</p>
              <p>
                You may try reloading the browser to see if the problem has been
                resolved.
              </p>
              <code>{state.message}</code>
            </span>
          );
      }
    })();

    const icon = (() => {
      switch (state.status) {
        case IFrameWrapperStatus.NONE:
        case IFrameWrapperStatus.CONNECTING:
          return false;
        case IFrameWrapperStatus.ERROR:
          return (
            <FontAwesomeIcon
              icon={faExclamation}
              size="lg"
              color="red"
              style={{ marginRight: '0.5rem' }}
            />
          );
      }
    })();

    const severity = (() => {
      switch (state.status) {
        case IFrameWrapperStatus.NONE:
        case IFrameWrapperStatus.CONNECTING:
          return 'info';
        case IFrameWrapperStatus.ERROR:
          return 'error';
      }
    })();

    function renderLoading() {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'absolute',
            left: '0',
            right: '0',
            top: '0',
            bottom: '0',
          }}
        >
          <Alert sx={{ m: 4, width: '40rem' }} severity={severity} icon={icon}>
            <AlertTitle>{title}</AlertTitle>
            {loadingMessage}
          </Alert>
        </div>
      );
    }

    return <LoadingOverlay>{renderLoading()}</LoadingOverlay>;
  }

  return (
    <div data-testid="legacy-iframe-wrapper" className={classes.main}>
      {renderLoadingOverlay(state)}
      <iframe
        className={classes.iframe}
        // sandbox="allow-downloads allow-downloads-without-user-activation allow-forms allow-modals allow-popups allow-same-origin allow-top-navigation allow-scripts"
        // We want the src to always match the content of the iframe, so as not to
        // cause the iframe to reload inappropriately
        src={legacyURL.toString()}
        ref={legacyContentRef}
        allow="clipboard-read; clipboard-write"
        title="kbase-ui Wrapper"
      />
    </div>
  );
}
