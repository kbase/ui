import * as d3 from 'd3';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useD3Viz = (
  cbs: {
    /** This callback will be run any time a _new_ viz is rendered (`deps` change, or SVG `data-d3-initialized` arg is undefined) */
    init?: (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => void;
    /** This callback will be run any time the return 'redraw' function is called, and following calls of `init` */
    draw: (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => void;
  },
  deps: Array<unknown> = []
) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Completely re-render the viz when the deps change!
  const [svgElement, { init, draw }] = useMemo(() => {
    const key = uuidv4();
    return [[<svg key={key} ref={svgRef} />], cbs];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);

  const redraw = useCallback(() => {
    if (svgRef.current) {
      const svgSelection = d3.select(svgRef.current);
      if (!svgSelection.attr('data-d3-initialized') && init) {
        init(svgSelection);
        svgSelection.attr('data-d3-initialized', true);
      }
      draw(svgSelection);
    }
  }, [init, draw]);

  //
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(redraw, [svgRef.current]);

  return { svgElement, redraw };
};
