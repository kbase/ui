import { setProcessEnv } from '../../common/testUtils';

import * as utils from './utils';
const { createLegacyPath, parseLegacyPath } = utils;

describe('Legacy utils', () => {
  describe('legacyBaseURL function', () => {
    test('returns the expected url if there is a legacy domain and no base path', () => {
      setProcessEnv({ legacyDomain: 'bar.example.com' });
      expect(utils.legacyBaseURL().toString()).toEqual(
        'https://bar.example.com/'
      );
    });

    test('returns the expected url if there is a legacy hostname and a base path', () => {
      setProcessEnv({ legacyDomain: 'baz.example.com', legacyBasePath: 'foo' });
      expect(utils.legacyBaseURL().toString()).toEqual(
        'https://baz.example.com/foo'
      );
    });
  });

  describe('parseLegacyPath', () => {
    test('can parse valid paths', () => {
      const tests: Array<[string, string, string, Record<string, string>]> = [
        ['/legacy/', '', '/', {}],
        ['/legacy/foo', '', 'foo', {}],
        ['/legacy/bar/baz', '', 'bar/baz', {}],
        ['/legacy/foo/bar/baz/bing/bong', '', 'foo/bar/baz/bing/bong', {}],
        ['/legacy//foo', '', 'foo', {}],
        ['anything/may/come/before/legacy/foo', '', 'foo', {}],
      ];

      for (const [pathname, searchString, resultPath, resultParams] of tests) {
        const { path, params } = parseLegacyPath(
          pathname,
          new URLSearchParams(searchString)
        );
        expect(path).toEqual(resultPath);
        expect(params).toEqual(resultParams);
      }
    });

    test('can parse valid paths and params', () => {
      const tests: Array<[string, string, string, Record<string, string>]> = [
        // Just real search params should work.
        ['/legacy/', 'foo=bar&baz=buzz', '/', { foo: 'bar', baz: 'buzz' }],
        // Just pathname search params and no real search params should work
        [
          '/legacy/foo$bar=buzz&ping=pong',
          '',
          'foo',
          { bar: 'buzz', ping: 'pong' },
        ],
        // Both sources of search params should be merged
        [
          '/legacy/foo$bar=baz',
          'ping=pong',
          'foo',
          { bar: 'baz', ping: 'pong' },
        ],
      ];

      for (const [pathname, searchString, resultPath, resultParams] of tests) {
        const { path, params } = parseLegacyPath(
          pathname,
          new URLSearchParams(searchString)
        );
        expect(path).toEqual(resultPath);
        expect(params).toEqual(resultParams);
      }
    });

    test('can parse weird paths', () => {
      const tests: Array<[string, string, string, Record<string, string>]> = [
        ['/legacy///', '', '/', {}],
        ['/legacy///foo', '', 'foo', {}],
        ['/legacy///bar////baz///', '', 'bar/baz', {}],
      ];

      for (const [pathname, searchString, resultPath, resultParams] of tests) {
        const { path, params } = parseLegacyPath(
          pathname,
          new URLSearchParams(searchString)
        );
        expect(path).toEqual(resultPath);
        expect(params).toEqual(resultParams);
      }
    });

    test('throws if the path is not a legacy path', () => {
      const tests = ['', 'foo', 'legacy', '/legacy'];

      for (const pathname of tests) {
        expect(() => {
          parseLegacyPath(pathname, new URLSearchParams(''));
        }).toThrow(`Not a legacy path: ${pathname}`);
      }
    });
  });

  describe('parseLegacyURL', () => {
    test('can parse a simple single legacy url', () => {
      // TODO: set the legacy base path first
      const url = new URL('http://localhost/legacy/foo');
      const { path, params } = utils.parseLegacyURL(url);
      expect(path).toEqual('foo');
      expect(params).toEqual({});
    });

    test('can parse a legacy url with parameters', () => {
      const url = new URL('http://localhost/legacy/foo?bar=baz&ping=pong');
      const { path, params } = utils.parseLegacyURL(url);
      expect(path).toEqual('foo');
      expect(params).toEqual({ bar: 'baz', ping: 'pong' });
    });

    test('an invalid path will trigger a simple exception', () => {
      const url = new URL('http://localhost/foo');
      expect(() => {
        utils.parseLegacyURL(url);
      }).toThrowError('Not a legacy path: /foo');
    });
  });

  describe('createNavigationPath function', () => {
    test('creates a correct path', () => {
      const testData: Array<{
        args: [string, Record<string, string>] | [string];
        expected: string;
      }> = [
        {
          args: ['a_path', { some: 'params' }],
          expected: '/legacy/a_path$some=params',
        },
        {
          args: ['a_path', { some: 'params', and: 'more params' }],
          expected: '/legacy/a_path$some=params&and=more+params',
        },
        {
          args: ['another_path', {}],
          expected: '/legacy/another_path',
        },
        {
          args: ['yet/another/path'],
          expected: '/legacy/yet/another/path',
        },
      ];

      for (const {
        args: [path, params],
        expected,
      } of testData) {
        const result = createLegacyPath(path, params);
        expect(result).toEqual(expected);
      }
    });
  });

  describe('areRecordsEqual function', () => {
    test('resolves to true in a variety of test cases', () => {
      const testCases: {
        input: Parameters<typeof utils.areParamsEqual>;
        expectedOutput: boolean;
      }[] = [
        {
          input: [{}, {}],
          expectedOutput: true,
        },
        {
          input: [{ foo: 'bar' }, { foo: 'bar' }],
          expectedOutput: true,
        },
        {
          input: [
            { foo: 'bar', bar: 'baz' },
            { bar: 'baz', foo: 'bar' },
          ],
          expectedOutput: true,
        },
        {
          input: [undefined, undefined],
          expectedOutput: true,
        },
      ];

      for (const { input, expectedOutput } of testCases) {
        expect(utils.areParamsEqual(...input)).toEqual(expectedOutput);
      }
    });

    test('resolves to false in a variety of test cases', () => {
      const testCases: {
        input: Parameters<typeof utils.areParamsEqual>;
        expectedOutput: boolean;
      }[] = [
        // one is undefined, other not
        {
          input: [undefined, {}],
          expectedOutput: false,
        },
        // first not undefined, second undefined
        {
          input: [{}, undefined],
          expectedOutput: false,
        },
        // different keys
        {
          input: [{ foo: 'bar' }, { bar: 'baz' }],
          expectedOutput: false,
        },
        // different values
        {
          input: [{ foo: 'bar' }, { foo: 'baz' }],
          expectedOutput: false,
        },
        // different number of keys.
        {
          input: [
            { foo: 'bar', bar: 'baz' },
            { bar: 'baz', foo: 'bar', fee: 'fie' },
          ],
          expectedOutput: false,
        },
      ];

      for (const { input, expectedOutput } of testCases) {
        expect(utils.areParamsEqual(...input)).toEqual(expectedOutput);
      }
    });
  });
});
