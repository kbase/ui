/**
 * Utilities for validating external redirect URLs.
 *
 * External URLs must be HTTPS and match a whitelisted domain pattern.
 * Wildcards like *.berdl.kbase.us are supported, but TLD-only
 * wildcards (*.com, *.us) are rejected for security.
 */

export const getRedirectWhitelist = (): string[] => {
  const whitelist = process.env.REACT_APP_REDIRECT_WHITELIST || '';
  return whitelist
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean);
};

/**
 * Validates that a wildcard pattern is not too broad.
 * Rejects patterns like *.com or *.co.uk that would match any domain.
 * Requires at least 2 domain parts after the wildcard.
 */
export const isValidWildcardPattern = (pattern: string): boolean => {
  if (!pattern.startsWith('*.')) return true; // exact domain, always valid
  const withoutWildcard = pattern.slice(2);
  const parts = withoutWildcard.split('.');
  return parts.length >= 2; // e.g., *.berdl.kbase.us has 3 parts
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
 * - Wildcard patterns must not be too broad
 */
export const isWhitelistedExternalUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);

    // Must be HTTPS
    if (parsed.protocol !== 'https:') return false;

    const whitelist = getRedirectWhitelist();
    return whitelist.some(
      (pattern) =>
        isValidWildcardPattern(pattern) &&
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
  return value.startsWith('https://') || value.startsWith('http://');
};
