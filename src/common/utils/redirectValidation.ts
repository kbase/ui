/**
 * Utilities for validating external redirect URLs.
 *
 * External URLs must be HTTPS and match a whitelisted domain pattern.
 * Wildcards like *.berdl.kbase.us are supported. Literal "*" is rejected.
 */

export const getRedirectWhitelist = (): string[] => {
  const whitelist = process.env.REACT_APP_REDIRECT_WHITELIST || '';
  return whitelist
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean);
};

/**
 * Checks if a hostname matches a domain pattern.
 * Supports wildcards: *.berdl.kbase.us matches hub.berdl.kbase.us
 */
export const matchesWildcard = (hostname: string, pattern: string): boolean => {
  if (pattern.startsWith('*.')) {
    const suffix = pattern.slice(1); // ".berdl.kbase.us"
    return hostname.endsWith(suffix) || hostname === pattern.slice(2);
  }
  return hostname === pattern;
};

/**
 * Validates if a URL is whitelisted for external redirect.
 * - Must be HTTPS
 * - Must match a pattern in the whitelist
 * - Rejects if whitelist contains literal "*"
 */
export const isWhitelistedExternalUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);

    // Must be HTTPS
    if (parsed.protocol !== 'https:') return false;

    const whitelist = getRedirectWhitelist();

    if (whitelist.includes('*')) return false;

    return whitelist.some((pattern) =>
      matchesWildcard(parsed.hostname, pattern)
    );
  } catch {
    return false;
  }
};

/**
 * Checks if a string looks like an external URL (starts with http:// or https://)
 */
export const isExternalUrl = (value: string): boolean => {
  const lower = value.toLowerCase();
  return lower.startsWith('https://') || lower.startsWith('http://');
};
