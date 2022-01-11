import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

export default function Legacy() {
  const history = useHistory();

  const legacyContent = useRef<HTMLIFrameElement>(null);

  const initPath =
    history.location.pathname.split(/\/legacy/)[1] + history.location.hash;
  const [initialLegacyPath, setInitialLegacyPath] = useState<string>(initPath);
  const [legacyPath, setLegacyPath] = useState<string>(initPath);

  useEffect(() => {
    // This effect compares the inner and outer URLS (app URL and iframe URL)
    // to the current known URL in state. If the inner URL differs, the state
    // and outer URLs are updated to match the inner URL. If the outer URL
    // differs, the inner and state URLs are updated to match the outer URL.
    // If both inner & outer URLs differ from state, the inner URL takes
    // precedence.

    const checkInterval = setInterval(() => {
      const innerLocation = legacyContent.current?.contentWindow?.location;
      const outerLocation = window.location;
      if (innerLocation) {
        // ensures the iframe has mounted
        const inner = innerLocation.pathname + (innerLocation.hash ?? '');
        const outer =
          outerLocation.pathname.split(/\/legacy/)[1] +
          (outerLocation.hash ?? '');
        if (inner !== legacyPath) {
          setLegacyPath(inner);
          history.push(`/legacy${inner}`);
        } else if (outer !== legacyPath) {
          setLegacyPath(outer);
          setInitialLegacyPath(outer);
          history.push(`/legacy${outer}`);
          legacyContent.current?.contentDocument?.location.reload();
        }
      }
    }, 200);
    return () => {
      clearInterval(checkInterval);
    };
  }, [history, legacyContent, legacyPath]);

  return (
    <section>
      <iframe
        src={initialLegacyPath}
        ref={legacyContent}
        title="Legacy Content"
        width="100%"
        height="1000vh"
      />
    </section>
  );
}