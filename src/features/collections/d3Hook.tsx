import * as d3 from 'd3';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useD3Viz = (
  callbacks: {
    /** This callback will be run any time a _new_ viz is rendered (`deps` change, or SVG `data-d3-initialized` arg is undefined) */
    init?: (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => void;
    /** This callback will be run any time the return 'redraw' function is called, and following calls of `init` */
    draw: (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => void;
  },
  /** A change to the deps triggers a completely new figure to be created (new svg element will be created and `init` will run again) */
  deps: Array<unknown> = []
) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Allows for state to be used in init/draw, otherwise `redraw` would create a
  // closure with the *initially passed* callback values and any state variables
  // used therein
  const callbacksRef = useRef<Parameters<typeof useD3Viz>[0]>(callbacks);
  callbacksRef.current = callbacks;

  // Completely re-render the viz when the deps change!
  const svgElement = useMemo(() => {
    const key = uuidv4();
    return [<svg key={key} ref={svgRef} />];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);

  const redraw = useCallback(() => {
    const { init, draw } = callbacksRef.current;
    if (svgRef.current) {
      const svgSelection = d3.select(svgRef.current);
      if (!svgSelection.attr('data-d3-initialized') && init) {
        init(svgSelection);
        svgSelection.attr('data-d3-initialized', true);
      }
      draw(svgSelection);
    }
  }, []);

  useEffect(redraw, [redraw, svgRef.current]);

  return { svgElement, redraw };
};
