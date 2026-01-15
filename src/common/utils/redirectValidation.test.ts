import {
  isExternalUrl,
  isValidWildcardPattern,
  matchesWildcard,
  getRedirectWhitelist,
  isWhitelistedExternalUrl,
} from './redirectValidation';

describe('isExternalUrl', () => {
  test('returns true for https URLs', () => {
    expect(isExternalUrl('https://example.com')).toBe(true);
    expect(isExternalUrl('https://hub.berdl.kbase.us/path')).toBe(true);
  });

  test('returns true for http URLs', () => {
    expect(isExternalUrl('http://example.com')).toBe(true);
  });

  test('handles case variations in protocol', () => {
    expect(isExternalUrl('HTTPS://example.com')).toBe(true);
    expect(isExternalUrl('HTTP://example.com')).toBe(true);
    expect(isExternalUrl('Https://example.com')).toBe(true);
  });

  test('returns false for JSON-encoded paths', () => {
    expect(isExternalUrl('{"pathname":"/narratives"}')).toBe(false);
    expect(isExternalUrl('"/profile"')).toBe(false);
  });

  test('returns false for plain paths', () => {
    expect(isExternalUrl('/narratives')).toBe(false);
    expect(isExternalUrl('narratives')).toBe(false);
  });
});

describe('isValidWildcardPattern', () => {
  test('accepts exact domains', () => {
    expect(isValidWildcardPattern('hub.berdl.kbase.us')).toBe(true);
    expect(isValidWildcardPattern('example.com')).toBe(true);
  });

  test('accepts wildcards with 2+ domain parts', () => {
    expect(isValidWildcardPattern('*.berdl.kbase.us')).toBe(true);
    expect(isValidWildcardPattern('*.kbase.us')).toBe(true);
    expect(isValidWildcardPattern('*.example.com')).toBe(true);
  });

  test('rejects TLD-only wildcards', () => {
    expect(isValidWildcardPattern('*.com')).toBe(false);
    expect(isValidWildcardPattern('*.us')).toBe(false);
    expect(isValidWildcardPattern('*.org')).toBe(false);
  });
});

describe('matchesWildcard', () => {
  test('matches exact domains', () => {
    expect(matchesWildcard('example.com', 'example.com')).toBe(true);
    expect(matchesWildcard('hub.berdl.kbase.us', 'hub.berdl.kbase.us')).toBe(
      true
    );
  });

  test('does not match different exact domains', () => {
    expect(matchesWildcard('other.com', 'example.com')).toBe(false);
  });

  test('matches wildcard subdomains', () => {
    expect(matchesWildcard('hub.berdl.kbase.us', '*.berdl.kbase.us')).toBe(
      true
    );
    expect(matchesWildcard('hub.dev.berdl.kbase.us', '*.berdl.kbase.us')).toBe(
      true
    );
    expect(matchesWildcard('anything.kbase.us', '*.kbase.us')).toBe(true);
  });

  test('matches wildcard base domain', () => {
    expect(matchesWildcard('berdl.kbase.us', '*.berdl.kbase.us')).toBe(true);
  });

  test('does not match unrelated domains with wildcard', () => {
    expect(matchesWildcard('hub.other.com', '*.berdl.kbase.us')).toBe(false);
    expect(matchesWildcard('kbase.us', '*.berdl.kbase.us')).toBe(false);
  });
});

describe('getRedirectWhitelist', () => {
  const originalEnv = process.env.REACT_APP_REDIRECT_WHITELIST;

  afterEach(() => {
    process.env.REACT_APP_REDIRECT_WHITELIST = originalEnv;
  });

  test('returns empty array when not set', () => {
    delete process.env.REACT_APP_REDIRECT_WHITELIST;
    expect(getRedirectWhitelist()).toEqual([]);
  });

  test('returns empty array for empty string', () => {
    process.env.REACT_APP_REDIRECT_WHITELIST = '';
    expect(getRedirectWhitelist()).toEqual([]);
  });

  test('parses single domain', () => {
    process.env.REACT_APP_REDIRECT_WHITELIST = '*.berdl.kbase.us';
    expect(getRedirectWhitelist()).toEqual(['*.berdl.kbase.us']);
  });

  test('parses comma-separated domains', () => {
    process.env.REACT_APP_REDIRECT_WHITELIST =
      '*.berdl.kbase.us,*.other.kbase.us';
    expect(getRedirectWhitelist()).toEqual([
      '*.berdl.kbase.us',
      '*.other.kbase.us',
    ]);
  });

  test('trims whitespace', () => {
    process.env.REACT_APP_REDIRECT_WHITELIST =
      '  *.berdl.kbase.us  ,  *.other.kbase.us  ';
    expect(getRedirectWhitelist()).toEqual([
      '*.berdl.kbase.us',
      '*.other.kbase.us',
    ]);
  });

  test('filters empty entries', () => {
    process.env.REACT_APP_REDIRECT_WHITELIST =
      '*.berdl.kbase.us,,*.other.kbase.us,';
    expect(getRedirectWhitelist()).toEqual([
      '*.berdl.kbase.us',
      '*.other.kbase.us',
    ]);
  });
});

describe('isWhitelistedExternalUrl', () => {
  const originalEnv = process.env.REACT_APP_REDIRECT_WHITELIST;

  afterEach(() => {
    process.env.REACT_APP_REDIRECT_WHITELIST = originalEnv;
  });

  test('returns false when whitelist is empty', () => {
    process.env.REACT_APP_REDIRECT_WHITELIST = '';
    expect(isWhitelistedExternalUrl('https://hub.berdl.kbase.us')).toBe(false);
  });

  test('returns true for whitelisted domain', () => {
    process.env.REACT_APP_REDIRECT_WHITELIST = '*.berdl.kbase.us';
    expect(isWhitelistedExternalUrl('https://hub.berdl.kbase.us')).toBe(true);
    expect(isWhitelistedExternalUrl('https://hub.berdl.kbase.us/path')).toBe(
      true
    );
    expect(
      isWhitelistedExternalUrl('https://hub.dev.berdl.kbase.us/path?query=1')
    ).toBe(true);
  });

  test('returns false for non-whitelisted domain', () => {
    process.env.REACT_APP_REDIRECT_WHITELIST = '*.berdl.kbase.us';
    expect(isWhitelistedExternalUrl('https://evil.com')).toBe(false);
    expect(isWhitelistedExternalUrl('https://other.kbase.us')).toBe(false);
  });

  test('returns false for HTTP URLs', () => {
    process.env.REACT_APP_REDIRECT_WHITELIST = '*.berdl.kbase.us';
    expect(isWhitelistedExternalUrl('http://hub.berdl.kbase.us')).toBe(false);
  });

  test('returns false for invalid URLs', () => {
    process.env.REACT_APP_REDIRECT_WHITELIST = '*.berdl.kbase.us';
    expect(isWhitelistedExternalUrl('not-a-url')).toBe(false);
    expect(isWhitelistedExternalUrl('')).toBe(false);
  });

  test('returns false when pattern is too broad', () => {
    process.env.REACT_APP_REDIRECT_WHITELIST = '*.com';
    expect(isWhitelistedExternalUrl('https://evil.com')).toBe(false);
  });

  test('works with multiple whitelist entries', () => {
    process.env.REACT_APP_REDIRECT_WHITELIST =
      '*.berdl.kbase.us,exact.example.com';
    expect(isWhitelistedExternalUrl('https://hub.berdl.kbase.us')).toBe(true);
    expect(isWhitelistedExternalUrl('https://exact.example.com')).toBe(true);
    expect(isWhitelistedExternalUrl('https://other.example.com')).toBe(false);
  });
});
