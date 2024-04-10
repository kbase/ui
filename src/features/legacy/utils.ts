/**
 * Miscellaneous support files for the legacy (kbase-ui) integration.
 */
import { v4 as uuidv4 } from 'uuid';
import { LEGACY_BASE_ROUTE } from './constants';

/**
 * A regex to match and extract path components from a "legacy" url pathname, as
 * created by Europa.
 *
 * The legacy path looks like:
 *
 * `BASE_ROUTE/some/path$param1=value1&param2=value2`
 *
 * where
 * `BASE_ROUTE` is stored in the constants file, and is therefore fixed in the codebase,
 * and at present is `/legacy`.
 * `some/path` is a path into kbase-ui, which will be presented in the initial iframe
 * src url as a hash-path
 * `$param1=value1&param2=value2` is an optional set of parameters in "search params"
 * format; this form rather than a url search component, as the latter will cause the
 * iframt to reload.
 */
const LEGACY_PATHNAME_REGEX = new RegExp(
  `(?:${LEGACY_BASE_ROUTE()})/(.*?)(?:[?$](.*))?$`
);

/**
 * The result of parsing a legacy path.
 */
export interface LegacyPath {
  path: string;
  params?: Record<string, string>;
}

/**
 * Returns the given path string with the "legacy" prefix removed, and the path and
 * parameters parsed and placed into the LegacyPath structure.
 *
 * @param pathname The pathname for kbase-ui, intended to be a hash path in the url
 * formed to kbase-ui
 * @param searchParams The parameters for the kbase-ui path, in canonical form
 * @returns The parsed legacy path in a LegacyPath structure
 */
export function parseLegacyPath(
  pathname: string,
  searchParams: URLSearchParams
): LegacyPath {
  const match = pathname.match(LEGACY_PATHNAME_REGEX);
  if (match === null) {
    throw new Error(`Not a legacy path: ${pathname}`);
  }
  const [, pathString, paramsString] = match;

  // Create a path list from a path string, removing any empty path components which may
  // have resulted from either an initial `/` or actual empty path segments.
  const path =
    pathString
      .split('/')
      .filter((pathComponent) => pathComponent.length > 0)
      .join('/') || '/';

  // First we take the params from the pathname.
  const mergedParams = new URLSearchParams(paramsString || '');

  // Then merge in any "real" search params.
  for (const [key, value] of Array.from(searchParams.entries())) {
    mergedParams.set(key, value);
  }

  // Convert the url search params to a record.
  const params: Record<string, string> = {};
  for (const [key, value] of Array.from(mergedParams.entries())) {
    params[key] = value;
  }

  return { path, params };
}

/**
 * Given a full url to a legacy resource, as may be discovered in the browser when a
 * legacy resource has been navigated to, parse out the fundamental information we need
 * - the path and the parameters.
 *
 * @param url
 * @returns
 */
export function parseLegacyURL(url: URL): LegacyPath {
  return parseLegacyPath(url.pathname, url.searchParams);
}

/**
 * Create a url which can serve as the base for calling the legacy (kbase-ui) ui endpoint.
 *
 * As such, it honors the domain and base path configured for kbase-ui, and enforces https.
 *
 * @returns
 */
export function legacyBaseURL(): URL {
  const legacyDomain = process.env.REACT_APP_KBASE_LEGACY_DOMAIN;
  const legacyBasePath = process.env.REACT_APP_KBASE_LEGACY_BASE_PATH;
  return new URL(`https://${legacyDomain}/${legacyBasePath}`);
}

/**
 * Determine if kbase-ui is running on a subdomain, based on whether the legacy domain
 * matches the kbase deploy environment domain.
 *
 * @returns {boolean}
 */
export function isSubdomain(): boolean {
  return (
    process.env.REACT_APP_KBASE_LEGACY_DOMAIN !==
    process.env.REACT_APP_KBASE_DOMAIN
  );
}

/**
 * Given a path and perhaps a set of parameters, create a path suitable for addressing
 * an endpoint within kbase-ui.
 *
 * Honors the optional base path (route).
 *
 * @param path
 * @param params
 * @returns
 */
export function createLegacyPath(
  path: string,
  params?: Record<string, string>
): string {
  // Use the search params object as it is handy for constructing a valid search
  // component string.
  const searchParams = new URLSearchParams(params);

  // Package up the params into a fake search string - fake in that the prefix is a
  // dollar sign.
  const hashSearchParams =
    Array.from(searchParams.keys()).length > 0
      ? `$${searchParams.toString()}`
      : '';

  // Note that we use the "real" search component string, but attach it to the path
  // (which is identical to the hash path inside kbase-ui) with a dollar sign ($)
  // and not a question mark (?). This avoids the reload that occurs when using a
  // "?".
  return `${LEGACY_BASE_ROUTE()}/${path}${hashSearchParams}`;
}

/**
 * Determines whether two given sets of parameters are equal.
 *
 * Order of keys does not matter.
 *
 *
 * @param record1
 * @param record2
 * @returns Whether they are equal or not.
 */
export function areParamsEqual(
  record1?: Record<string, string>,
  record2?: Record<string, string>
) {
  if (typeof record1 === 'undefined') {
    if (typeof record2 !== 'undefined') {
      return false;
    } else {
      return true;
    }
  } else {
    if (typeof record2 === 'undefined') {
      return false;
    }
  }

  const keys1 = Object.keys(record1).sort();
  const keys2 = Object.keys(record2).sort();

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let i = 0; i < keys1.length; i += 1) {
    if (keys1[i] !== keys2[i]) {
      return false;
    }
  }

  for (const key of keys1) {
    if (record1[key] !== record2[key]) {
      return false;
    }
  }

  return true;
}

export function generateReceiveChannelId() {
  return uuidv4();
}

export function generateSendChannelId() {
  return uuidv4();
}
