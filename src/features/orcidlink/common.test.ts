import { uiURL } from './utils';

describe('The common module uiURL function', () => {
  // We can get away with a shallow copy, since env is shallow.
  const INITIAL_ENV = { ...process.env };

  beforeEach(() => {
    process.env = INITIAL_ENV;
  });

  it('creates a sensible url using the expected environment variable', () => {
    process.env.REACT_APP_KBASE_DOMAIN = 'example.com';
    const url = uiURL('foo');
    expect(url.toString()).toBe('https://example.com/foo');
  });

  it('creates a sensible url without the expected environment variable', () => {
    process.env.REACT_APP_KBASE_DOMAIN = '';
    const url = uiURL('foo');
    expect(url.toString()).toBe(`${window.location.origin}/foo`);
  });
});
