/**
 * The main task of this component is to interface between Europa and the embedding
 * support for kbase-ui in IFrameWrapper.
 *
 * As such, it makes liberal usage of custom hooks to reach into the system.
 */
import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../../common/hooks';
import { useAuthenticateFromToken, useLogout } from '../auth/hooks';
import { usePageTitle } from '../layout/layoutSlice';
import IFrameWrapper, { OnLoggedInParams } from './IFrameWrapper';
import classes from './Legacy.module.scss';
import {
  generateReceiveChannelId,
  generateSendChannelId,
  legacyBaseURL,
  parseLegacyURL,
} from './utils';

/**
 * The Legacy Component
 *
 * @returns
 */
export default function Legacy() {
  // Many of the data dependencies (use...) are collected here, for clarity.
  const token = useAppSelector(({ auth: { token } }) => {
    return token;
  });

  const logout = useLogout();

  // All this is to coordinate setting the title (in header, browser window, etc.) from
  // the kbase-ui message `kbase-ui.set-title`.
  const [legacyTitle, setLegacyTitle] = useState('');
  usePageTitle(legacyTitle);
  function setTitle(title: string) {
    setLegacyTitle(title);
  }

  // Create a stateful channel id so that we can interact with the useEffect below.
  const [channelIds, setChannelIds] = useState<{
    sendChannelId: string;
    receiveChannelId: string;
  } | null>(null);

  // Legacy URL is set below, just once, when the component is loaded.
  // The legacy url does not change as the europa url does. Rather, we use a stable url
  // to the root of kbase-ui, and all navigation to kbase-ui from Europa is expressed
  // through messages.
  const [legacyURL, setLegacyURL] = useState<URL | null>(null);
  useEffect(() => {
    const receiveChannelId = generateReceiveChannelId();
    const sendChannelId = generateSendChannelId();

    const url = new URL(legacyBaseURL());
    url.searchParams.set('sendChannelId', sendChannelId);
    url.searchParams.set('receiveChannelId', receiveChannelId);
    // The legacy URL is always just a base url now; all nav is through window messages.
    setLegacyURL(url);
    setChannelIds({ sendChannelId, receiveChannelId });
  }, [setLegacyURL, setChannelIds]);

  // We depend upon the current react-router location
  const location = useLocation();

  // Build a complete url for the current url. We start with the current origin, which
  // will be stable, and the current location as provided by react router.
  const europaURL = new URL(window.location.origin);
  europaURL.pathname = location.pathname;
  europaURL.search = location.search;
  const legacyPath = parseLegacyURL(europaURL);

  const { authenticate } = useAuthenticateFromToken();

  // ------------------------------
  // EVENT HANDLERS
  // ------------------------------

  /**
   * Event Handlers
   *
   * We prefer to have most events handled by function props that we pass in from here.
   * This allows easier testing of IFrameWrapper, and reduces its size.
   */

  /**
   * Handles the "kbase-ui.session.loggedin" message from kbase-ui, which is emitted
   * after a sign in or sign up.
   *
   * Note that this is propagated back to kbase-ui, since kbase-ui considers Europa to
   * be the source of truth for setting authentication. May seem a bit counterintuitive,
   * but allows (a) the propagation of auth upon startup and (b) will accommodate Europa
   * taking over sign in and sign up in the future.
   *
   * @param loginMessagePayload
   */
  function onLoggedIn({ token, onAuthResolved }: OnLoggedInParams) {
    authenticate({ token, onAuthResolved });
  }

  const onLogOut = useCallback(() => {
    logout();
  }, [logout]);

  // Return early on the first render, before critical values are calculated. Note that we don't
  // display anything initially. Don't worry, we use an overlay cover with a loading
  // message, so the user will not see (much of a) blank view.
  if (channelIds === null || legacyURL === null) {
    return null;
  }

  const { sendChannelId, receiveChannelId } = channelIds;

  return (
    <div className={classes.main}>
      <IFrameWrapper
        // variable
        legacyPath={legacyPath}
        token={token || null}
        // static
        // key={channelId}
        sendChannelId={sendChannelId}
        receiveChannelId={receiveChannelId}
        legacyURL={legacyURL}
        spyOnChannels={false}
        setTitle={setTitle}
        onLoggedIn={onLoggedIn}
        onLogOut={onLogOut}
      />
    </div>
  );
}
