/**
 * Creates a URL object given the configured KBase domain and a path.
 *
 * This is suitable for creating external links in the same KBase deploy environment.
 *
 * @param path
 * @returns
 */
export function uiURL(path: string) {
  let origin: string;
  if (process.env.REACT_APP_KBASE_DOMAIN) {
    origin = `https://${process.env.REACT_APP_KBASE_DOMAIN}`;
  } else {
    origin = window.location.origin;
  }

  const url = new URL(origin);
  url.pathname = path;

  return url;
}
