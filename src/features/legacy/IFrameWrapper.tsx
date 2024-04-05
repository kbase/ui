import { faExclamation, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, AlertTitle, Grow, LinearProgress } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingOverlay from '../../common/components/OverlayContainer';
import {
  CONNECTION_MONITORING_INTERVAL,
  CONNECTION_TIMEOUT,
} from './constants';
import classes from './IFrameWrapper.module.scss';
import KBaseUIConnection from './KBaseUIConnection';
import { KBaseUIRedirectPayload } from './mesageValidation';
import TimeoutMonitor, { TimeoutMonitorStatus } from './TimeoutMonitor';
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
  channelId: string;

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
 * Captures all recognized stats of the iframe wrapper component
 * NONE - initial state
 * CONNECTING - actively engaged in creating a connection to kbase-ui
 * CONNECTED - connection to kbase-ui established
 * ERROR - some error occurred while connecting
 */
export enum IFrameWrapperStatus {
  NONE = 'NONE',
  CONNECTING = 'CONNECTING',
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
  limit: number;
  elapsed: number;
}

export interface IFrameWrapperStateConnected extends IFrameWrapperStatBase {
  status: IFrameWrapperStatus.CONNECTED;
}

export interface IFrameWrapperStateError extends IFrameWrapperStatBase {
  status: IFrameWrapperStatus.ERROR;
  message: string;
}

export type IFrameWrapperState =
  | IFrameWrapperStateNone
  | IFrameWrapperStateConnecting
  | IFrameWrapperStateConnected
  | IFrameWrapperStateError;

export interface LegacyPath {
  path: string;
  params?: Record<string, string>;
}

export default function IFrameWrapper({
  channelId,
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

  const [kbaseUIConnection, setKBaseUIConnection] =
    useState<KBaseUIConnection | null>(null);

  const navigate = useNavigate();

  const previousLegacyPathRef = useRef<LegacyPath | null>(null);

  const location = useLocation();

  /**
   * Create and set up the connection to kbase-ui.
   * Only set the connection state property after everything is finished.
   * That way we don't end up with the connection being used before it is ready...
   */

  function onRedirect({ url }: KBaseUIRedirectPayload): void {
    window.open(url, '_self');
  }

  const syncedState = useRef<IFrameWrapperState>(state);
  syncedState.current = state;

  /**
   * In this effect, the connection is established.
   */
  useEffect(() => {
    // Should never occur, but required for type narrowing, so let us honor it for what
    // it is.
    if (!legacyContentRef.current || !legacyContentRef.current.contentWindow) {
      return;
    }

    // Ensures this effect is only run once.
    if (initialized.current) {
      return;
    }
    initialized.current = true;

    const connection = new KBaseUIConnection({
      kbaseUIWindow: legacyContentRef.current.contentWindow,
      kbaseUIOrigin: legacyURL.origin,
      spyOnChannels,
      navigate,
      setTitle,
      onLoggedIn,
      onLogOut,
      onRedirect,
    });

    const doConnect = async () => {
      try {
        setState({
          status: IFrameWrapperStatus.CONNECTING,
          limit: CONNECTION_TIMEOUT(),
          elapsed: 0,
        });

        const monitor = new TimeoutMonitor({
          timeout: CONNECTION_TIMEOUT(),
          interval: CONNECTION_MONITORING_INTERVAL(),
          onTimeout: (elapsed: number) => {
            connection.cancel();
            setState({
              status: IFrameWrapperStatus.ERROR,
              message: `Connection to kbase-ui timed out after ${elapsed}ms`,
            });
          },
          onInterval: (elapsed: number) => {
            setState({
              status: IFrameWrapperStatus.CONNECTING,
              limit: CONNECTION_TIMEOUT(),
              elapsed: (() => {
                if (monitor.state.status === TimeoutMonitorStatus.RUNNING) {
                  return Date.now() - monitor.state.started;
                } else {
                  return 0;
                }
              })(),
            });
          },
        });
        monitor.start();

        await connection.connect();

        monitor.stop();

        // Post-connection tasks.

        connection.authnavigate({
          token: token || null,
          navigation: legacyPath,
        });

        setState({ status: IFrameWrapperStatus.CONNECTED });
      } catch (ex) {
        setState({
          status: IFrameWrapperStatus.ERROR,
          message: ex instanceof Error ? ex.message : 'Unknown Error',
        });
      }
    };

    // We only set the connection in component state once it is fully complete.
    // NB we need to use old-style promise chaining for useEffect.
    doConnect()
      .then(() => {
        setKBaseUIConnection(connection);
      })
      .catch((ex) => {
        setState({
          status: IFrameWrapperStatus.ERROR,
          message: ex instanceof Error ? ex.message : 'Unknown Error',
        });
      });

    return connection.disconnect();
  }, [
    // dynamic
    // kbaseUIConnection,
    legacyPath,
    token,
    syncedState,
    // static
    legacyURL,
    spyOnChannels,
    setKBaseUIConnection,
    navigate,
    setTitle,
    onLoggedIn,
    onLogOut,
    setState,
  ]);

  // const [titleProxy, setTitleProxy] = useState<string>('');

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
                <Grow in={state.elapsed > 1000} unmountOnExit>
                  <div>
                    <div>
                      {Intl.NumberFormat('en-US', {
                        style: 'percent',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(state.elapsed / state.limit)}
                    </div>
                    <LinearProgress
                      variant="determinate"
                      value={(100 * state.elapsed) / state.limit}
                    />
                  </div>
                </Grow>
              </div>
            </div>
          );
        case IFrameWrapperStatus.ERROR:
          return (
            <span>
              <p>An error ocurred connecting to kbase-ui.</p>
              <pre>{state.message}</pre>
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
          <Alert style={{ margin: '1rem' }} severity={severity} icon={icon}>
            <AlertTitle>{title}</AlertTitle>
            {loadingMessage}
          </Alert>
        </div>
      );
    }

    return <LoadingOverlay>{renderLoading()}</LoadingOverlay>;
  }

  const initialized = useRef<boolean>(false);

  // Monitor for changes in the url.
  useEffect(() => {
    if (!kbaseUIConnection) {
      return;
    }
    // Generate the legacy path from the current window location.
    const url = new URL(window.location.origin);
    url.pathname = location.pathname;
    new URLSearchParams(location.search).forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    const { path, params } = parseLegacyURL(url);

    // Handle transition from one location to another (i.e. navigation)
    if (
      previousLegacyPathRef.current === null ||
      previousLegacyPathRef.current.path !== path ||
      !areParamsEqual(previousLegacyPathRef.current.params, params)
    ) {
      previousLegacyPathRef.current = { path, params };

      kbaseUIConnection.navigate(path, params);
    }
  }, [kbaseUIConnection, location]);

  /**
   * This effect monitors auth state for changes and sends the appropriate message to kbase-ui
   */
  const previousTokenRef = useRef(token);
  useEffect(() => {
    if (!kbaseUIConnection) {
      return;
    }
    const previousToken = previousTokenRef.current;
    previousTokenRef.current = token;

    // Handle transition from unauthenticated to authenticated.
    if (previousToken === null) {
      if (token !== null) {
        // Note no next request, as this is from the side effect of authentication
        // happening outside of this session - e.g. logging in in a different window.
        kbaseUIConnection.authenticated({ token });
      }
    } else if (token === null) {
      // Handle transition from authenticated to unauthenticated.
      kbaseUIConnection.deauthenticated({});
    }
  }, [token, previousTokenRef, kbaseUIConnection]);

  return (
    <div data-testid="legacy-iframe-wrapper" className={classes.main}>
      {renderLoadingOverlay(state)}
      <iframe
        className={classes.iframe}
        // sandbox="allow-downloads allow-downloads-without-user-activation allow-forms allow-modals allow-popups allow-same-origin allow-top-navigation allow-scripts"
        // We want the src to always match the content of the iframe, so as not to
        // cause the iframe to reload inappropriately
        src={legacyURL.toString()}
        data-channel-id={channelId}
        ref={legacyContentRef}
        allow="clipboard-read; clipboard-write"
        title="kbase-ui Wrapper"
      />
    </div>
  );
}
