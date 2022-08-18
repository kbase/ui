import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/** Creates and manages an iframe for any legacy KBaseUI page,
 * modifies the history to point to the iframe's path,
 * and sets the iframe's head>base element to have target="_top",
 * so that navigation behaves as expected.
 * TODO: hide KBaseUI's topbar and left navbar.
 * TODO: extract title from iframe topbar and set it as the page title.
 */
export default function Legacy() {
  const location = useLocation();
  const navigate = useNavigate();

  const legacyContent = useRef<HTMLIFrameElement>(null);
  const legacyFrame = legacyContent?.current?.contentWindow;
  const pathSyncInterval = 200;

  // path state
  const initPath = legacyPart(location.pathname) + location.hash;
  const [initialLegacyPath, setInitialLegacyPath] = useState<string>(initPath);
  const [legacyPath, setLegacyPath] = useState<string>(initPath);
  const [badLegacyPath, setBadLegacyPath] = useState<boolean>(false);

  //height state
  const [legacyHeight, setLegacyHeight] = useState<string>('0');

  // This effect compares the outer and inner URLS (window URL and iframe URL)
  // to the current known URL in state. If the inner URL differs, the state
  // and outer URLs are updated to match the inner URL. If the outer URL
  // differs, the inner and state URLs are updated to match the outer URL.
  // If both inner & outer URLs differ from state, the inner URL takes
  // precedence. It also manages the iframe height, as this needs to be updated
  // manually.
  useEffect(() => {
    const pathAndHeightSync = setInterval(() => {
      // check if iframe is inaccessible due to CORS
      if (!checkIFrameSameOrigin(legacyContent.current?.contentWindow)) {
        setBadLegacyPath(true);
        alert(
          // eslint-disable-next-line max-len
          'Something went wrong: Could not load external link within legacy page iframe.'
        );
        return;
      } else {
        setBadLegacyPath(false);
      }

      // paths to sync
      const innerLocation = legacyContent.current?.contentWindow?.location;
      const outerLocation = window.location;
      let pathChanged = false;

      // ensure the iframe has mounted before trying to sync paths
      if (innerLocation && innerLocation.pathname !== 'blank') {
        const inner = innerLocation.pathname + (innerLocation.hash ?? '');
        const outer =
          legacyPart(outerLocation.pathname) + (outerLocation.hash ?? '');
        if (inner !== legacyPath) {
          setLegacyPath(inner);
          pathChanged = true;
          navigate(`/legacy${inner}`);
        } else if (outer !== legacyPath) {
          setLegacyPath(outer);
          setInitialLegacyPath(outer);
          legacyContent.current.src = outer;
          pathChanged = true;
        }
      }

      // set iframe height when the path changes or content exceeds the iframe
      // this may be slow if the inner content changes height frequently
      setLegacyHeight(
        getIFrameHeight(legacyContent.current, pathChanged, legacyHeight)
      );
    }, pathSyncInterval);

    return () => {
      clearInterval(pathAndHeightSync);
    };
  }, [navigate, legacyContent, legacyPath, legacyHeight]);

  // This effect recursively injects <base target="_top"> into all child
  // iframe's `<head>` tags. this is necessary to allow the iframe to navigate
  // to third-party sites outside of the iframe.
  useMonkeyPatchIFrameLinks(legacyFrame);

  if (badLegacyPath) {
    return null;
  } else {
    return (
      <iframe
        style={{ overflowY: 'hidden' }}
        frameBorder="0"
        src={initialLegacyPath}
        ref={legacyContent}
        title="Legacy Content"
        width="100%"
        height={legacyHeight}
      />
    );
  }
}

const legacyPart = (path: string) =>
  path.match(/(?:\/legacy)+(\/.*)$/)?.[1] || '/';

/** Checks that an IFrame's contents can be seen without triggering CORS*/
const checkIFrameSameOrigin = (
  contentWindow?: HTMLIFrameElement['contentWindow']
) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    !!contentWindow?.document;
  } catch (error) {
    return false;
  }
  return true;
};

/** On an interval, traverse the window tree to find all iframes. Ignore
 * iframes that are cross-origin. Then, inject <base target="_top"> into
 * all kbase iframe's `<head>` tags.*/
const useMonkeyPatchIFrameLinks = (topFrame?: Window | null) => {
  useEffect(() => {
    if (!topFrame) return; // exit early if the top level iframe DNE

    const checkInterval = setInterval(() => {
      const checkFrames: Window[] = [topFrame];
      const currentFrames: Window[] = [];
      while (checkFrames.length > 0) {
        const frame = checkFrames.pop() as Window;
        if (checkIFrameSameOrigin(frame)) {
          if (frame.frames.length > 0) {
            for (let i = 0; i < frame.frames.length; i++) {
              checkFrames.push(frame.frames[i]);
            }
          }
          currentFrames.push(frame);
        }
      }

      currentFrames.forEach((frame) => {
        // modify the iframes only after the DOM content has loaded
        if (frame.document.readyState === 'complete') {
          monkeyPatchIFrameLinks(frame);
        } else {
          frame.addEventListener('load', () => {
            monkeyPatchIFrameLinks(frame);
          });
        }
      });
    }, 200);

    return () => clearInterval(checkInterval);
  }, [topFrame]);
};

const monkeyPatchIFrameLinks = (frame: Window) => {
  const base =
    frame.document.head.querySelector('base') ||
    frame.document.head.appendChild(frame.document.createElement('base'));
  base.setAttribute('target', '_top');
};

const getIFrameHeight = (
  iframe: HTMLIFrameElement | null,
  pathChanged: boolean,
  legacyHeight: string
) => {
  const iframeBody = iframe?.contentWindow?.document.body;
  const checkheight = iframeBody?.scrollHeight.toString();
  if (iframe && checkheight && (pathChanged || checkheight !== legacyHeight)) {
    const scrollY = window.scrollY; // save current scroll position
    // reset iframe height to max container height, force reflow
    iframe.height = (
      window.innerHeight -
      (iframe.parentElement?.getBoundingClientRect().top || 0) -
      4
    ).toString();
    // use reflowed scroll height to set iframe height
    const setHeight = iframeBody?.scrollHeight.toString() || checkheight;
    iframe.height = setHeight;
    window.scrollTo(0, scrollY); // restore scroll position
    return setHeight;
  }
  return legacyHeight;
};
