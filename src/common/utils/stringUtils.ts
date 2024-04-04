/**
 * Utility functions for manipulating strings.
 */

/**
 * Make a readable string from a snake-case string
 * Eg. "comparative_genomics" -> "Comparative genomics"
 * This makes the string sentence case. E.g.:
 * some_kind_of_string -> Some kind of string
 * @param {string} str the snake-case string to change
 * @return {string}
 */
export function snakeCaseToHumanReadable(str: string): string {
  str = str.replace(/_/g, ' ');
  str = str[0].toUpperCase() + str.slice(1);
  return str;
}

/**
 * Get a friendly readable name from a workspace object type
 * E.g. "KBaseMatrices.AmpliconMatrix-1.2" -> "Amplicon Matrix"
 * @param {string} type the workspace type string to break apart
 * @return {string}
 */
export function getWSTypeName(type: string): string {
  const matches = type.match(/[a-zA-Z]*\.([a-zA-Z]+)(-\d+\.\d+)?/);
  if (!matches || matches.length < 2) {
    throw new Error('Invalid workspace type name: ' + type);
  }
  const match = matches[1];
  // Insert a space before all caps and trim
  return match.replace(/([A-Z][a-z])/g, ' $1').trim();
}

/**
 * Template string tag function for encoding values for a URI with encodeURIComponent
 * ```
 * import { uriEncodeTemplateTag as encode } from './stringUtils';
 * const unencoded_var = 'var_content?';
 * const encoded = encode`/uri/path/${'/foo/foo'}/more/path/${unencoded_var}`
 * // encoded === "/uri/path/%2Ffoo%2Ffoo/more/path/var_content%3F"
 * ```
 */
export function uriEncodeTemplateTag(
  strings: TemplateStringsArray,
  ...values: unknown[]
) {
  let output = '';
  const stringsArr = [...strings];
  while (stringsArr.length || values.length) {
    if (stringsArr.length) output += stringsArr.shift();
    if (values.length) {
      const value = values.shift();
      const valueSafe = (
        ['string', 'boolean', 'number'].includes(typeof value)
          ? value
          : String(value)
      ) as string | boolean | number;
      output += encodeURIComponent(valueSafe);
    }
  }
  return output;
}

/**
 * Convert a number into a formatted string with commas and decimals.
 * This could be replaced with a more robust number formatter library.
 */
export function formatNumber(num: number) {
  return num.toLocaleString();
}

/**
 * Count the number of decimals in a given float or int
 */
export function countDecimals(num: number) {
  if (num % 1 !== 0) return num.toString().split('.')[1].length;
  return 0;
}
