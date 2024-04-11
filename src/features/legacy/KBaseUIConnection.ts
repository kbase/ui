import { createSearchParams, NavigateFunction } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { OnLoggedInParams } from './IFrameWrapper';
import {
  assertKBaseUIConnectPayload,
  assertKBaseUILoggedinPayload,
  assertKBaseUINavigatedPayload,
  assertKBaseUIRedirectPayload,
  assertKBaseUISetTitlePayload,
  EuropaAuthenticatedPayload,
  EuropaAuthnavigatePayload,
  EuropaConnectPayload,
  EuropaDeauthenticatedPayload,
  EuropaNavigatePayload,
  KBaseUILoggedinPayload,
  KBaseUINavigatedPayload,
  KBaseUIRedirectPayload,
  NextRequest,
  NextRequestObject,
} from './messageValidation';
import ReceiveChannel from './ReceiveChannel';
import SendChannel, { ChannelMessage } from './SendChannel';
import { createLegacyPath } from './utils';

// Connection Status

export enum ConnectionStatus {
  NONE = 'NONE',
  CONNECTING = 'CONNECTING',
  AWAITING_START = 'AWAITING_START',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export interface ConnectionStateBase {
  status: ConnectionStatus;
}

export interface ConnectionStateNone extends ConnectionStateBase {
  status: ConnectionStatus.NONE;
}

export interface ConnectionStateConnecting extends ConnectionStateBase {
  status: ConnectionStatus.CONNECTING;
  receiveChannel: ReceiveChannel;
  sendChannel: SendChannel;
}

export interface ConnectionStateAwaitingStart extends ConnectionStateBase {
  status: ConnectionStatus.AWAITING_START;
  receiveChannel: ReceiveChannel;
  sendChannel: SendChannel;
}

export interface ConnectionStateConnected extends ConnectionStateBase {
  status: ConnectionStatus.CONNECTED;
  receiveChannel: ReceiveChannel;
  sendChannel: SendChannel;
}

export interface ConnectionStateError extends ConnectionStateBase {
  status: ConnectionStatus.ERROR;
  message: string;
}

export type ConnectionState =
  | ConnectionStateNone
  | ConnectionStateConnecting
  | ConnectionStateAwaitingStart
  | ConnectionStateConnected
  | ConnectionStateError;

export interface KBaseUIConnectionConstructorParams {
  sendChannelId: string;
  receiveChannelId: string;
  kbaseUIOrigin: string;
  kbaseUIWindow: Window;
  spyOnChannels?: boolean;
}

export interface StartParams {
  navigate: NavigateFunction;
  setTitle: (title: string) => void;
  onLoggedIn: (payload: OnLoggedInParams) => void;
  onLogOut: () => void;
  onRedirect: (paylod: KBaseUIRedirectPayload) => void;
  onLostConnection: (message: string) => void;
}

export function channelSpy(direction: string, message: ChannelMessage) {
  // eslint-disable-next-line no-console
  console.info(
    `[KBaseUIConnection][spy][${direction}]`,
    message.envelope.channel,
    message.name
  );
}

export interface ConnectParams {
  token: string | null;
  path: string;
  params?: Record<string, string>;
}

export default class KBaseUIConnection {
  connectionState: ConnectionState;
  params: KBaseUIConnectionConstructorParams;
  id: string = uuidv4();
  constructor(params: KBaseUIConnectionConstructorParams) {
    this.params = params;
    this.connectionState = {
      status: ConnectionStatus.NONE,
    };
  }

  europaWindow(): Window {
    return window.parent;
  }

  /**
   * Update Europa and the browser with a navigation that has occurred within kbase-ui.
   *
   * The 'navigation' message from kbase-ui informs Europa that a navigation has
   * occurred. The message contains the path and params for the navigation, which are
   * provided here. The job of this function is to update the Europa window history so
   * that the current location in kbase-ui is reflected in the browser's location bar.
   * This is important for (a) communicating to the user the current resource being
   * displayed and (b) providing the url for capture or reloading.
   *
   * Note that the URL set in the browser is in the "legacy" format.
   *
   * @param path The path within kbase-ui, i.e. the hash path
   * @param params The params within kbase-ui
   */
  handleNavigationMessage(
    { path, params, type }: KBaseUINavigatedPayload,
    navigate: NavigateFunction
  ): void {
    // normalize path
    const pathname = `/${path
      .split('/')
      .filter((x) => !!x)
      .join('/')}`;

    switch (type) {
      case 'europaui':
        navigate(
          { pathname, search: createSearchParams(params).toString() },
          { replace: true }
        );
        break;
      case 'kbaseui':
      default:
        navigate(
          {
            pathname: createLegacyPath(path),
            search: createSearchParams(params).toString(),
          },
          { replace: true }
        );
    }
  }

  handleLoggedin(
    { token, expires, nextRequest }: KBaseUILoggedinPayload,
    navigate: NavigateFunction,
    onLoggedIn: (payload: OnLoggedInParams) => void
  ) {
    if (this.connectionState.status !== ConnectionStatus.CONNECTED) {
      return;
    }

    const next: NextRequestObject = (() => {
      if (nextRequest) {
        return nextRequest;
      }
      // Yes, without a next request, we redirect to the narratives navigator.
      // NB this used to be in kbase-ui, but makes more sense here.
      // TODO: perhaps change to root and let the route configuration determine the
      // default route...
      return {
        path: {
          path: '/narratives',
          type: 'europaui',
        },
        label: 'Narratives Navigator',
      };
    })();

    // A callback called after authentication has been resolved.
    // This is the only way I could find to have an action run after the whole auth
    // setting dance. This callback function is passed through the "onLoggedIn" prop,
    // which in turn
    //
    // Besides being more efficient for the EX (no wait required), the callback
    // technique is more precise, as it is only called when auth succeeds.

    // TODO: use the token from onAuthResolved.
    const onAuthResolved = () => {
      if (next.path.type === 'kbaseui') {
        // If we are staying in kbase-ui, we want to tell it to authenticate itself and
        // then navigate somewhere
        if (this.connectionState.status !== ConnectionStatus.CONNECTED) {
          return;
        }
        this.connectionState.sendChannel.send<EuropaAuthenticatedPayload>(
          'europa.authenticated',
          {
            token,
            navigation: {
              path: next.path.path,
              params: next.path.params,
            },
          }
        );
      } else {
        navigate(next.path.path);
      }
    };

    // This essentially sets up a chain of actions:
    // - validate the auth by talking to the auth service (async, obviously)
    // - set the auth state in the store appropriately
    onLoggedIn({ token, expires, onAuthResolved });
  }

  async connect(timeout: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const timer = window.setTimeout(() => {
        const elapsed = Date.now() - start;
        reject(
          new Error(
            `Timed out connection to kbase-ui after ${elapsed}ms, with a timeout of ${timeout}ms`
          )
        );
      }, timeout);

      const receiveSpy = this.params.spyOnChannels
        ? (() => {
            return (message: ChannelMessage) => {
              channelSpy('RECV', message);
            };
          })()
        : undefined;

      const receiveChannel = new ReceiveChannel({
        window,
        expectedOrigin: this.params.kbaseUIOrigin,
        channel: this.params.receiveChannelId,
        spy: receiveSpy,
      });

      const sendSpy = this.params.spyOnChannels
        ? (() => {
            return (message: ChannelMessage) => {
              channelSpy('SEND', message);
            };
          })()
        : undefined;

      const sendChannel = new SendChannel({
        window: this.params.kbaseUIWindow,
        targetOrigin: this.params.kbaseUIOrigin,
        channel: this.params.sendChannelId,
        spy: sendSpy,
      });

      this.connectionState = {
        status: ConnectionStatus.CONNECTING,
        receiveChannel,
        sendChannel,
      };

      receiveChannel.once('kbase-ui.connect', (payload: unknown) => {
        // We've received the connect request from kbase-ui, so let's tell kbase-ui in
        // response that we are here too.
        assertKBaseUIConnectPayload(payload);

        // We need to send to the partner channel with the channel id it has specified.
        // sendChannel.setChannelId(payload.channel);

        // And we need to let the other channel send to us on our channel id.
        // const receiveChannelId = uuidv4();
        // receiveChannel.setChannelId(receiveChannelId);

        sendChannel.send<EuropaConnectPayload>('europa.connect', {
          channelId: this.params.receiveChannelId,
        });
      });

      receiveChannel.once('kbase-ui.connected', () => {
        // Set up all messages we will respond to while the connection is active.
        this.connectionState = {
          status: ConnectionStatus.AWAITING_START,
          receiveChannel: receiveChannel,
          sendChannel: sendChannel,
        };
        window.clearTimeout(timer);
        resolve();
      });

      receiveChannel.start();
    });
  }

  async start(params: StartParams): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connectionState.status !== ConnectionStatus.AWAITING_START) {
        reject(new Error('Not AWAITING_START - cannot start'));
        return;
      }

      const { receiveChannel, sendChannel } = this.connectionState;

      receiveChannel.on('kbase-ui.navigated', (payload: unknown) => {
        assertKBaseUINavigatedPayload(payload);
        this.handleNavigationMessage(payload, params.navigate);
      });

      receiveChannel.on('kbase-ui.set-title', (payload: unknown) => {
        assertKBaseUISetTitlePayload(payload);
        params.setTitle(payload.title);
      });

      receiveChannel.on('kbase-ui.logout', () => {
        params.onLogOut();
      });

      receiveChannel.on('kbase-ui.redirect', (payload: unknown) => {
        assertKBaseUIRedirectPayload(payload);
        params.onRedirect(payload);
      });

      receiveChannel.on('kbase-ui.loggedin', (payload: unknown) => {
        assertKBaseUILoggedinPayload(payload);
        this.handleLoggedin(payload, params.navigate, params.onLoggedIn);
      });

      this.connectionState = {
        status: ConnectionStatus.CONNECTED,
        receiveChannel: receiveChannel,
        sendChannel: sendChannel,
      };

      resolve();
    });
  }

  disconnect() {
    if (
      this.connectionState.status === ConnectionStatus.CONNECTING ||
      this.connectionState.status === ConnectionStatus.AWAITING_START ||
      this.connectionState.status === ConnectionStatus.CONNECTED
    ) {
      this.connectionState.receiveChannel.stop();
    }
  }

  /**
   * Sends a
   *
   * @param path
   * @param params
   */
  navigate(path: string, params?: Record<string, string>) {
    if (this.connectionState.status !== ConnectionStatus.CONNECTED) {
      return;
    }
    this.connectionState.sendChannel.send<EuropaNavigatePayload>(
      'europa.navigate',
      {
        path,
        params,
      }
    );
  }

  /**
   * Sends both authentication and navigation instructions to kbase-ui.
   *
   * This is used in only one location, just after first connecting to kbase-ui. The
   * reason for it's existence, when it would seem like authenticated and deauthenticated
   * might suffice, is that upon the initial connection there is always a navigation,
   * whereas pure auth events may not have a navigation.
   *
   * @param param0
   */
  authnavigate({
    token,
    navigation,
  }: {
    token: string | null;
    navigation: NextRequest;
  }) {
    if (this.connectionState.status !== ConnectionStatus.CONNECTED) {
      return;
    }
    this.connectionState.sendChannel.send<EuropaAuthnavigatePayload>(
      'europa.authnavigate',
      {
        token,
        navigation,
      }
    );
  }

  /**
   * Sends authentication instructions to kbase-ui.
   *
   * Normally sent after a login event in this or another window, although technically
   * it may be triggered by any change in the auth token from absent to a valid token.
   *
   * @param param0
   */
  authenticated({
    token,
    navigation,
  }: {
    token: string;
    navigation?: NextRequest;
  }) {
    if (this.connectionState.status !== ConnectionStatus.CONNECTED) {
      return;
    }
    this.connectionState.sendChannel.send<EuropaAuthenticatedPayload>(
      'europa.authenticated',
      {
        token,
        navigation,
      }
    );
  }

  /**
   * Sends "de-authentication" instructions to kbase-ui.
   *
   * A somewhat strange word, "de-authenticating" means to remove the authentication
   * from a session which is currently authenticated.
   *
   * @param param0
   */
  deauthenticated({ navigation }: { navigation?: NextRequest }) {
    if (this.connectionState.status !== ConnectionStatus.CONNECTED) {
      return;
    }
    this.connectionState.sendChannel.send<EuropaDeauthenticatedPayload>(
      'europa.deauthenticated',
      { navigation }
    );
  }
}
