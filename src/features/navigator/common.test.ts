/* common.test */
import { normalizeVersion } from './common';

describe('The function normalizeVersion...', () => {
  test('rejects infinite versions.', () => {
    expect(() => normalizeVersion(Infinity)).toThrow();
  });

  test('rejects fractional versions.', () => {
    expect(() => normalizeVersion(12.34)).toThrow();
  });

  test('rejects excessively finite versions.', () => {
    expect(() => normalizeVersion(9007199254740992)).toThrow();
  });
});
