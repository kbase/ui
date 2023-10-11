/* common/index.ts */

export const isInsideIframe: (w: Window) => boolean = (w) =>
  Boolean(w) && Boolean(w.top) && w !== w.top;
