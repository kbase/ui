import {
  assertKBaseUIConnectedPayload,
  assertKBaseUIConnectPayload,
  assertKBaseUILoggedinPayload,
  assertKBaseUINavigatedPayload,
  assertKBaseUIRedirectPayload,
  assertKBaseUISetTitlePayload,
} from './messageValidation';

describe('messageValidation', () => {
  describe('assertKBaseUISetTitlePayload', () => {
    test('succeeds on a valid object', () => {
      const testValue = { title: 'foo' };
      expect(() => {
        assertKBaseUISetTitlePayload(testValue);
      }).not.toThrow();
    });

    test('fails on invalid object', () => {
      const testValue = { foo: 'foo' };
      expect(() => {
        assertKBaseUISetTitlePayload(testValue);
      }).toThrow();
    });
  });

  describe('assertKBaseUILoggedinPayload', () => {
    test('succeeds on a valid, minimal object', () => {
      const testValue = { token: 'foo', expires: 123 };
      expect(() => {
        assertKBaseUILoggedinPayload(testValue);
      }).not.toThrow();
    });

    test('fails on invalid, minimal object', () => {
      const testValues = [
        {},
        { token: 'foo' },
        { expires: 123 },
        { token: 123, expires: 456 },
        { token: 'foo', expires: 'bar' },
      ];
      for (const testValue of testValues) {
        expect(() => {
          assertKBaseUILoggedinPayload(testValue);
        }).toThrow();
      }
    });
  });

  describe('assertKBaseUINavigationPayload', () => {
    test('succeeds on a valid, minimal object', () => {
      const testValue = { path: 'foo', params: { bar: 'baz' } };
      expect(() => {
        assertKBaseUINavigatedPayload(testValue);
      }).not.toThrow();
    });

    test('fails on invalid, minimal object', () => {
      const testValues = [
        {},
        { path: 123, params: { bar: 'baz' } },
        { path: 'foo', params: 'bar' },
        { path: 'foo' },
        { params: 'bar' },
      ];
      for (const testValue of testValues) {
        expect(() => {
          assertKBaseUINavigatedPayload(testValue);
        }).toThrow();
      }
    });
  });

  describe('assertKBaseUINavigationPayload', () => {
    test('succeeds on a valid, minimal object', () => {
      const testValue = { path: 'foo', params: { bar: 'baz' } };
      expect(() => {
        assertKBaseUINavigatedPayload(testValue);
      }).not.toThrow();
    });

    test('fails on invalid, minimal object', () => {
      const testValues = [
        {},
        { path: 123, params: { bar: 'baz' } },
        { path: 'foo', params: 'bar' },
        { path: 'foo' },
        { params: 'bar' },
      ];
      for (const testValue of testValues) {
        expect(() => {
          assertKBaseUINavigatedPayload(testValue);
        }).toThrow();
      }
    });
  });

  describe('assertKBaseUIConnectPayload', () => {
    test('succeeds on a valid, minimal object', () => {
      const testValue = { channel: 'foo' };
      expect(() => {
        assertKBaseUIConnectPayload(testValue);
      }).not.toThrow();
    });

    test('fails on invalid, minimal object', () => {
      const testValues = [{}, { channel: 123 }, { foo: 'bar' }];
      for (const testValue of testValues) {
        expect(() => {
          assertKBaseUIConnectPayload(testValue);
        }).toThrow();
      }
    });
  });

  describe('assertKBaseUIConnectedPayload', () => {
    test('succeeds on a valid, minimal object', () => {
      const testValue = {};
      expect(() => {
        assertKBaseUIConnectedPayload(testValue);
      }).not.toThrow();
    });

    test('fails on invalid, minimal object', () => {
      const testValues = [{ foo: 'bar' }, { channel: 123 }];
      for (const testValue of testValues) {
        expect(() => {
          assertKBaseUIConnectedPayload(testValue);
        }).toThrow();
      }
    });
  });

  describe('assertKBaseUIRedirectPayload', () => {
    test('succeeds on a valid, minimal object', () => {
      const testValue = { url: 'foo' };
      expect(() => {
        assertKBaseUIRedirectPayload(testValue);
      }).not.toThrow();
    });

    test('fails on invalid, minimal object', () => {
      const testValues = [{}, { url: 123 }, { url: true }, { foo: 'bar' }];
      for (const testValue of testValues) {
        expect(() => {
          assertKBaseUIRedirectPayload(testValue);
        }).toThrow();
      }
    });
  });
});
