import { ComponentProps, useEffect, useMemo, useRef, useState } from 'react';
import Plot from 'react-plotly.js';
import { getAttribScatter } from '../../../common/api/collectionsApi';
import { Loader } from '../../../common/components/Loader';
import { downsample as LTTB } from 'downsample-lttb-ts';
import { useTableViewParams } from './GenomeAttribs';
import { useFilters } from '../collectionsSlice';
import { parseError } from '../../../common/api/utils/parseError';
import { filterContextMode } from '../Filters';

export const AttribScatter = ({
  collection_id,
  xColumn,
  yColumn,
  downsample = 10000,
  size,
}: {
  collection_id: string;
  xColumn: string;
  yColumn: string;
  downsample?: number;
  size?: [width: number, height: number];
}) => {
  const { context, columnMeta, filterPanelOpen } = useFilters(collection_id);
  const viewParams = useTableViewParams(collection_id, {
    filtered: true,
    selected: filterContextMode(context) === 'selected',
    matched: filterContextMode(context) === 'matched',
  });
  const { data, isLoading, error } = getAttribScatter.useQuery({
    ...viewParams,
    xcolumn: xColumn,
    ycolumn: yColumn,
  });

  const shouldDownsample = Boolean(
    downsample !== undefined &&
      downsample > 0 &&
      (data?.data.length ?? 0 > downsample)
  );

  // viewport state to allow resampling on zoom
  const [viewport, setViewport] = useState<{
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  }>();

  const [plotData, count, originalCount] = useMemo(() => {
    if (!data) return [[], 0, 0];
    const allPoints = data.data.map(({ x, y }) => [x, y]);
    // Find the most extreme points. for auto-zoom purposes, we always want to plot these
    const outermost = allPoints.reduce(
      (outermost, point) => {
        if (point[0] < outermost.xMin[0]) outermost.xMin = point;
        if (point[0] > outermost.xMax[0]) outermost.xMax = point;
        if (point[1] < outermost.yMin[1]) outermost.yMin = point;
        if (point[1] > outermost.yMax[1]) outermost.yMax = point;
        return outermost;
      },
      {
        xMin: [Infinity, 0],
        xMax: [-Infinity, 0],
        yMin: [0, Infinity],
        yMax: [0, -Infinity],
      }
    );
    const outermostPoints = new Set(Object.values(outermost));

    let viewPoints = allPoints.filter((p) => !outermostPoints.has(p));

    // if we are zoomed in, filter points outside of our view.
    if (viewport) {
      viewPoints = viewPoints.filter(
        ([x, y]) =>
          x >= viewport.xMin &&
          x <= viewport.xMax &&
          y >= viewport.yMin &&
          y <= viewport.yMax
      );
    }

    const originalCount = viewPoints.length + outermostPoints.size;

    // downsample, if we should downsample
    if (shouldDownsample) {
      viewPoints = LTTB({
        series: viewPoints,
        threshold: Math.max(downsample - outermostPoints.size, 1),
      });
    }

    // construct our plot data
    const extremePointArr = Array.from(outermostPoints);
    const x = [...viewPoints, ...extremePointArr].map(([x, y]) => x);
    const y = [...viewPoints, ...extremePointArr].map(([x, y]) => y);

    const count = x.length;

    const plotData: ComponentProps<typeof Plot>['data'] = [
      { type: 'scattergl', mode: 'markers', x, y },
    ];

    return [plotData, count, originalCount];
  }, [data, downsample, shouldDownsample, viewport]);

  const title = `${xColumn} / ${yColumn}${
    shouldDownsample && originalCount !== count
      ? `<br>(downsampled to ${count}/${originalCount} points)`
      : ''
  }`;

  // Controlled state for plot layout (so we can change the title dynamically)
  const [plotLayout, setPlotLayout] = useState<
    ComponentProps<typeof Plot>['layout']
  >({
    height: size?.[1],
    width: size?.[0],
    margin: { t: 80 },
    title: title,
    xaxis: { title: { text: columnMeta?.[xColumn]?.display_name } },
    yaxis: { title: { text: columnMeta?.[yColumn]?.display_name } },
  });

  //Reset title on plot update, but don't create a new layout object (this causes an infinite loop)
  useEffect(() => {
    setPlotLayout((plotLayout) => {
      const layout = { ...plotLayout };
      layout.title = {
        text: title,
        yref: 'paper',
      };
      layout.xaxis = {
        title: { text: columnMeta?.[xColumn]?.display_name },
      };
      layout.yaxis = {
        title: { text: columnMeta?.[yColumn]?.display_name },
      };
      return layout;
    });
  }, [title, columnMeta, xColumn, yColumn]);

  const viewportChangeTimeout = useRef<number>();

  // Handle plot layout changes
  //(setPlotLayout to current layout object AND detect viewport bounds changes)
  const handleUpdate: ComponentProps<typeof Plot>['onUpdate'] = ({
    layout,
  }) => {
    setPlotLayout(layout);
    // debounce viewport changes as plotly sometimes fires many at once
    // and changing the viewport triggers a resample
    if (viewportChangeTimeout.current) {
      clearTimeout(viewportChangeTimeout.current);
    }
    viewportChangeTimeout.current = window.setTimeout(() => {
      const bounds: (number | undefined)[] = [
        layout.xaxis?.range?.[0],
        layout.xaxis?.range?.[1],
        layout.yaxis?.range?.[0],
        layout.yaxis?.range?.[1],
      ];
      // don't do anything if the axis bounds are undefined
      if (bounds.some((v) => v === undefined)) return;
      const [xMin, xMax, yMin, yMax] = bounds as number[];
      // if the bounds have changed, set the viewport state
      if (
        xMin !== viewport?.xMin ||
        xMax !== viewport?.xMax ||
        yMin !== viewport?.yMin ||
        yMax !== viewport?.yMax
      )
        setViewport({ xMin, xMax, yMin, yMax });
    }, 50);
  };

  // Force the chart to refresh when the filter panel opens or closes.
  // This ensures that the sizing of the chart responds to the width changes.
  useEffect(() => {
    setPlotLayout((plotLayout) => ({ ...plotLayout }));
  }, [filterPanelOpen]);

  if (plotData && !isLoading && !error) {
    return (
      <Plot
        data={plotData}
        layout={plotLayout}
        onUpdate={handleUpdate}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
      />
    );
  } else {
    return (
      <Loader
        loading={isLoading}
        error={error ? parseError(error).message : undefined}
      />
    );
  }
};
