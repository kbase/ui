import {
  snakeCaseToHumanReadable,
  getWSTypeName,
  uriEncodeTemplateTag as encode,
} from './stringUtils';

describe('snakeCaseToHumanReadable', () => {
  test('capitlizes string', () => {
    expect(snakeCaseToHumanReadable('aaaa')).toBe('Aaaa');
    expect(snakeCaseToHumanReadable('Aaaa')).toBe('Aaaa');
  });
  test('replaces underscores with spaces', () => {
    expect(snakeCaseToHumanReadable('this_is_a_thing')).toBe('This is a thing');
  });
  test('Corner cases', () => {
    expect(snakeCaseToHumanReadable('___')).toBe('   ');
    expect(snakeCaseToHumanReadable('_foo')).toBe(' foo');
    expect(snakeCaseToHumanReadable('one__two')).toBe('One  two');
    expect(snakeCaseToHumanReadable('one_two_')).toBe('One two ');
  });
});

describe('getWSTypeName', () => {
  test('extracts name', () => {
    expect(getWSTypeName('KBaseMatrices.AmpliconMatrix-1.2')).toBe(
      'Amplicon Matrix'
    );
  });
  test('throws on bad names', () => {
    expect(() => getWSTypeName('')).toThrow();
    expect(() => getWSTypeName('KBaseMatrices')).toThrow();
    expect(() => getWSTypeName('KBaseMatrices.')).toThrow();
  });
});

describe('uriEncodeTemplateTag', () => {
  test('encodes clean string', () => {
    const val = 'abc';
    expect(encode`/some/path/with/a/${val}/in/it`).toBe(
      '/some/path/with/a/abc/in/it'
    );
  });
  test('encodes dirty string', () => {
    const val = '?&#@/';
    expect(encode`/some/path/with/a/${val}/in/it`).toBe(
      '/some/path/with/a/%3F%26%23%40%2F/in/it'
    );
  });
  test('encodes boolean', () => {
    const val = true;
    expect(encode`/some/path/with/a/${val}/in/it`).toBe(
      '/some/path/with/a/true/in/it'
    );
  });
  test('encodes number', () => {
    const val = 42;
    expect(encode`/some/path/with/a/${val}/in/it`).toBe(
      '/some/path/with/a/42/in/it'
    );
  });
  test('encodes object as `[object Object]`', () => {
    const val = { someKey: 42 };
    expect(encode`/some/path/with/a/${val}/in/it`).toBe(
      '/some/path/with/a/%5Bobject%20Object%5D/in/it'
    );
  });
  test('encodes multiple variables', () => {
    expect(
      encode`/${'abc'}/${'?&#@/'}/${false}/${84}/${{ someKey: 42 }}/`
    ).toBe('/abc/%3F%26%23%40%2F/false/84/%5Bobject%20Object%5D/');
  });
});
