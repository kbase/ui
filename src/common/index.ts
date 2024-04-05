/* common/index.ts */

export const isInsideIframe: (w: Window) => boolean = (w) =>
  Boolean(w) && Boolean(w.top) && w !== w.top;

/**
 * Determine whether the app is running in a locally hosted development mode.
 *
 * @returns Whether the app is running in a locally hosted development server.
 */
export function isLocalDevelopment() {
  return (
    process.env.NODE_ENV === 'development' &&
    process.env.REACT_APP_KBASE_UI_DEV !== 'true'
  );
}
