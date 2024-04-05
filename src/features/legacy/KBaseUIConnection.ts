import { createSearchParams, NavigateFunction } from 'react-router-dom';
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
  KBaseUIConnectPayload,
  KBaseUILoggedinPayload,
  KBaseUINavigatedPayload,
  KBaseUIRedirectPayload,
  NextRequest,
  NextRequestObject,
} from './mesageValidation';
import ReceiveChannel from './ReceiveChannel';
import SendChannel, { ChannelMessage } from './SendChannel';
import { createLegacyPath } from './utils';

// Connection Status

export enum ConnectionStatus {
  NONE = 'NONE',
  CONNECTING = 'CONNECTING',
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
  | ConnectionStateConnected
  | ConnectionStateError;

export interface KBaseUIConnectionConstructorParams {
  //   europaWindow: Window;
  //   europaOrigin: string;
  //   initialChannelId: string;
  //   config: Config;
  kbaseUIOrigin: string;
  kbaseUIWindow: Window;
  spyOnChannels?: boolean;
  navigate: NavigateFunction;
  setTitle: (title: string) => void;
  onLoggedIn: (payload: OnLoggedInParams) => void;
  onLogOut: () => void;
  onRedirect: (paylod: KBaseUIRedirectPayload) => void;
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

export default class EuropaConnection {
  //   connectionState: ConnectionState;
  connectionStatus: ConnectionStatus;
  channelId: string;
  params: KBaseUIConnectionConstructorParams;
  receiveChannel: ReceiveChannel;
  sendChannel: SendChannel;
  constructor(params: KBaseUIConnectionConstructorParams) {
    this.params = params;
    // this.channelId = uuidv4();
    this.channelId = 'europa_kbaseui_channel';

    // this.connectionState = {
    //   status: ConnectionStatus.NONE,
    // };
    this.connectionStatus = ConnectionStatus.NONE;

    const receiveSpy = this.params.spyOnChannels
      ? (() => {
          return (message: ChannelMessage) => {
            channelSpy('RECV', message);
          };
        })()
      : undefined;

    this.receiveChannel = new ReceiveChannel({
      window,
      expectedOrigin: this.params.kbaseUIOrigin,
      channel: this.channelId,
      spy: receiveSpy,
    });

    const sendSpy = this.params.spyOnChannels
      ? (() => {
          return (message: ChannelMessage) => {
            channelSpy('SEND', message);
          };
        })()
      : undefined;

    this.sendChannel = new SendChannel({
      window: this.params.kbaseUIWindow,
      targetOrigin: this.params.kbaseUIOrigin,
      channel: this.channelId,
      spy: sendSpy,
    });
  }

  /**
   * We need the origin of Europa in order to send it messages.
   * The origin will always be either the
   *
   * @returns
   */
  //   sendMessageOrigin(): string {
  //     // ignore the "insecure" for now.
  //     // return this.insecureParent || this.europaTargetOrigin;
  //     const url = new URL(window.location.href);
  //     url.hostname = window.location.hostname.split('.').slice(-3).join('.');

  //     // return window.location.origin.replace('legacy.', '');
  //     return url.origin;
  //   }

  /**
   * We need the origin of Europa in order to send it messages.
   * The origin will always be either the
   *
   * @returns
   */
  //   kbaseUIOrigin(): string {
  //     // ignore the "insecure" for now.
  //     // return this.insecureParent || this.europaTargetOrigin;
  //     const url = new URL(window.location.href);
  //     url.hostname = window.location.hostname.split('.').slice(-3).join('.');

  //     // return window.location.origin.replace('legacy.', '');
  //     return url.origin;
  //   }

  europaWindow(): Window {
    return window.parent;
  }

  getChannelId(): string {
    const isSubdomain = window.location.host.split('.').length === 4;
    if (isSubdomain) {
      // TODO: should be a constant
      return 'europa_kbaseui_channel';
    } else {
      const channelIdFromElement =
        window.frameElement?.getAttribute('data-channel-id');
      if (!channelIdFromElement) {
        throw new Error("The 'data-channel-id' attribute is missing");
      }
      return channelIdFromElement;
    }
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
  handleNavigationMessage({
    path,
    params,
    type,
  }: KBaseUINavigatedPayload): void {
    // normalize path
    const pathname = `/${path
      .split('/')
      .filter((x) => !!x)
      .join('/')}`;

    switch (type) {
      case 'europaui':
        this.params.navigate(
          { pathname, search: createSearchParams(params).toString() },
          { replace: true }
        );
        break;
      case 'kbaseui':
      default:
        this.params.navigate(
          {
            pathname: createLegacyPath(path),
            search: createSearchParams(params).toString(),
          },
          { replace: true }
        );
    }
  }

  handleLoggedin({ token, expires, nextRequest }: KBaseUILoggedinPayload) {
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
        this.sendChannel.send<EuropaAuthenticatedPayload>(
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
        this.params.navigate(next.path.path);
      }
    };

    // This essentially sets up a chain of actions:
    // - validate the auth by talking to the auth service (async, obviously)
    // - set the auth state in the store appropriately
    this.params.onLoggedIn({ token, expires, onAuthResolved });
  }

  handleConnectMessage({ channel }: KBaseUIConnectPayload) {
    this.receiveChannel.setChannelId(channel);
    this.sendChannel.setChannelId(channel);
    this.sendChannel.send<EuropaConnectPayload>('europa.connect', {});
  }

  async connect(): Promise<void> {
    return new Promise((resolve) => {
      this.receiveChannel.once('kbase-ui.connect', (payload: unknown) => {
        // We've received the connect request from kbase-ui, so let's tell kbase-ui in
        // response that we are here too.
        assertKBaseUIConnectPayload(payload);
        this.handleConnectMessage(payload);
      });

      this.receiveChannel.once('kbase-ui.connected', () => {
        // Set up all messages we will respond to.
        this.connectionStatus = ConnectionStatus.CONNECTED;

        this.receiveChannel.on('kbase-ui.navigated', (payload: unknown) => {
          assertKBaseUINavigatedPayload(payload);
          this.handleNavigationMessage(payload);
        });

        this.receiveChannel.on('kbase-ui.set-title', (payload: unknown) => {
          assertKBaseUISetTitlePayload(payload);
          this.params.setTitle(payload.title);
        });

        this.receiveChannel.on('kbase-ui.logout', () => {
          this.params.onLogOut();
        });

        this.receiveChannel.on('kbase-ui.redirect', (payload: unknown) => {
          assertKBaseUIRedirectPayload(payload);
          this.params.onRedirect(payload);
        });

        this.receiveChannel.on('kbase-ui.loggedin', (payload: unknown) => {
          assertKBaseUILoggedinPayload(payload);
          this.handleLoggedin(payload);
        });

        // TODO: logged out

        resolve();
      });

      this.receiveChannel.start();
    });
  }

  cancel() {
    this.receiveChannel.stop();
  }

  disconnect() {
    // this.sendChannel.send('kbase-ui.disconnect', {});
    // this.receiveChannel.stop();
  }

  /**
   * Sends a
   *
   * @param path
   * @param params
   */
  navigate(path: string, params?: Record<string, string>) {
    this.sendChannel.send<EuropaNavigatePayload>('europa.navigate', {
      path,
      params,
    });
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
    this.sendChannel.send<EuropaAuthnavigatePayload>('europa.authnavigate', {
      token,
      navigation,
    });
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
    this.sendChannel.send<EuropaAuthenticatedPayload>('europa.authenticated', {
      token,
      navigation,
    });
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
    this.sendChannel.send<EuropaDeauthenticatedPayload>(
      'europa.deauthenticated',
      { navigation }
    );
  }
}
