import { RefObject, useEffect, useRef, useState } from 'react';
import { createSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { usePageTitle } from '../layout/layoutSlice';
import { useTryAuthFromToken } from '../auth/hooks';
import {
  LOGIN_ROUTE,
  SIGNUP_ROUTE,
  LEGACY_BASE_ROUTE,
} from '../../app/routes.constants';
import { useLogout } from '../login/LogIn';

// Re-export for backwards compatibility
export { LEGACY_BASE_ROUTE } from '../../app/routes.constants';

const LEGACY_REDIRECTS: Record<string, string> = {
  login: LOGIN_ROUTE,
  signup: SIGNUP_ROUTE,
};

export default function Legacy() {
  // TODO: external navigation and <base target="_top"> equivalent

  // TODO: consider adding integration tests for this feature, as unit tests
  // cannot test this component effectively

  const location = useLocation();
  const navigate = useNavigate();
  const logout = useLogout();

  const legacyContentRef = useRef<HTMLIFrameElement>(null);
  const [legacyTitle, setLegacyTitle] = useState('');
  usePageTitle(legacyTitle);

  // The path that should be in the iframe based on the current parent window location
  const expectedLegacyPath = getLegacyPart(
    location.pathname + location.search + location.hash
  );

  // Handle redirects for obsolete legacy paths
  useEffect(() => {
    let current = expectedLegacyPath;
    if (current[0] === '/' || current[0] === '#') {
      current = current.slice(1);
    }
    const redirect = LEGACY_REDIRECTS[current];
    if (redirect) {
      navigate(redirect, {
        replace: true,
      });
    }
    // We only want to run this when expectedLegacyPath changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expectedLegacyPath]);

  // The actual current path, set by navigation events from kbase-ui
  const [legacyPath, setLegacyPath] = useState(expectedLegacyPath);

  // State for token recieved via postMessage, for setting auth
  const [recievedToken, setReceivedToken] = useState<string | undefined>();
  // when recievedToken is defined and !== current token, this will try it for auth
  useTryAuthFromToken(recievedToken);

  // Listen for messages from the iframe
  useMessageListener(legacyContentRef, (e) => {
    const d = e.data;
    if (isRouteMessage(d)) {
      // Navigate the parent window when the iframe sends a navigation event
      let path = d.payload.request.original;
      if (path[0] === '/') path = path.slice(1);
      if (legacyPath !== path) {
        if (path === 'login') {
          // Catches login redirects from legacy to pass nextRequest
          navigate({
            pathname: LOGIN_ROUTE,
            search: createSearchParams({
              nextRequest: JSON.stringify(location),
            }).toString(),
          });
        } else if (Object.keys(LEGACY_REDIRECTS).includes(path)) {
          // Handle other redirects
          navigate(LEGACY_REDIRECTS[path]);
        } else {
          setLegacyPath(path);
          navigate(`./${path}`);
        }
      }
    } else if (isTitleMessage(d)) {
      setLegacyTitle(d.payload);
    } else if (isLoginMessage(d)) {
      if (d.payload.token) {
        setReceivedToken(d.payload.token);
      }
    } else if (isLogoutMessage(d)) {
      logout();
    }
  });

  // In order to enable the messages to work safely, we send the
  // parent domain on every render. This allows us to receive all
  // messages EXCEPT 'kbase-ui.session.loggedin' on cross-domain
  // parents (useful for dev), without allowing all ('*') targetDomains
  useEffect(() => {
    if (legacyContentRef.current?.contentWindow) {
      legacyContentRef.current.contentWindow.postMessage(
        {
          source: 'europa.identify',
          payload: window.location.origin,
        },
        `https://${import.meta.env.VITE_KBASE_LEGACY_DOMAIN}` || '*'
      );
    }
  });

  // The following enables navigation events from Europa to propagate to the
  // iframe. When expectedLegacyPath (from the main window URL) changes, check
  // that legacyPath (from the iframe) martches, otherwise, send the iframe a
  // postMessage with navigation instructions. legacyPath will be updated
  // downstream (the ui navigation event will send a message back to europa with
  // the new route). We only want to watch for changes on expectedLegacyPath
  // here, as watching legacyPath will cause this to run any time the iframe's
  // location changes.
  useEffect(() => {
    if (
      expectedLegacyPath !== legacyPath &&
      legacyContentRef.current?.contentWindow
    ) {
      legacyContentRef.current.contentWindow.postMessage(
        {
          source: 'europa.navigate',
          payload: { path: expectedLegacyPath },
        },
        `https://${import.meta.env.VITE_KBASE_LEGACY_DOMAIN}` || '*'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expectedLegacyPath, legacyContentRef]);

  return (
    <div
      data-testid="legacy-iframe-wrapper"
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        flexFlow: 'column nowrap',
      }}
    >
      <iframe
        frameBorder="0"
        // We want the src to always match the content of the iframe, so as not to
        // cause the iframe to reload inappropriately
        src={formatLegacyUrl(legacyPath)}
        ref={legacyContentRef}
        title="Legacy Content Wrapper"
        width="100%"
        height="100%"
      />
    </div>
  );
}

const legacyRegex = new RegExp(`(?:${LEGACY_BASE_ROUTE})(?:/+(.*))$`);
export const getLegacyPart = (path: string) =>
  path.match(legacyRegex)?.[1] || '/';

export const formatLegacyUrl = (path: string) =>
  `https://${import.meta.env.VITE_KBASE_LEGACY_DOMAIN}/#${path}`;

export const useMessageListener = function <T = unknown>(
  target: RefObject<HTMLIFrameElement>,
  handler: (ev: MessageEvent<T>) => void
) {
  useEffect(() => {
    const wrappedHandler = (ev: MessageEvent<T>) => {
      // When deployed we only want to listen to messages from the iframe itself
      // but we want to allow other sources for dev/test.
      if (
        import.meta.env.MODE === 'production' &&
        ev.source !== target.current?.contentWindow
      )
        return;
      handler(ev);
    };
    window.addEventListener('message', wrappedHandler);
    return () => {
      window.removeEventListener('message', wrappedHandler);
    };
  }, [handler, target]);
};

type Message<S extends string, P> = {
  source: S;
  payload: P;
};

const messageGuard = <S extends string, P>(
  source: S,
  payloadGuard: (payload: unknown) => payload is P
) => {
  type Guarded = Message<S, P>;
  return (recieved: unknown): recieved is Guarded =>
    typeof recieved === 'object' &&
    ['source', 'payload'].every(
      (k) => k in (recieved as Record<string, never>)
    ) &&
    (recieved as Guarded).source === source &&
    payloadGuard((recieved as Guarded).payload);
};

export const isTitleMessage = messageGuard(
  'kbase-ui.ui.setTitle',
  (payload): payload is string => typeof payload === 'string'
);

export const isRouteMessage = messageGuard(
  'kbase-ui.app.route-component',
  (payload): payload is { request: { original: string } } =>
    !!payload &&
    typeof payload === 'object' &&
    'request' in (payload as Record<string, never>) &&
    typeof (payload as Record<string, unknown>).request === 'object' &&
    'original' in (payload as Record<string, Record<string, never>>).request &&
    typeof (payload as Record<string, Record<string, string>>).request
      .original === 'string'
);

export const isLoginMessage = messageGuard(
  'kbase-ui.session.loggedin',
  (payload): payload is { token: string | null } =>
    !!payload &&
    typeof payload === 'object' &&
    'token' in (payload as Record<string, never>) &&
    (typeof (payload as Record<string, unknown>).token === 'string' ||
      (payload as Record<string, unknown>).token === null)
);

export const isLogoutMessage = messageGuard(
  'kbase-ui.session.loggedout',
  (payload): payload is undefined => payload === undefined
);
