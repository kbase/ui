import { ComponentProps, useEffect, useMemo, useRef, useState } from 'react';
import Plot from 'react-plotly.js';
import { getAttribScatter } from '../../../common/api/collectionsApi';
import { Loader } from '../../../common/components/Loader';
import { downsample as LTTB } from 'downsample-lttb-ts';

export const AttribScatter = ({
  collection_id,
  xColumn,
  yColumn,
  downsample = 10000,
}: {
  collection_id: string;
  xColumn: string;
  yColumn: string;
  downsample?: number;
}) => {
  const { data, isFetching } = getAttribScatter.useQuery({
    collection_id,
    xcolumn: xColumn,
    ycolumn: yColumn,
  });

  const shouldDownsample =
    downsample !== undefined &&
    downsample > 0 &&
    (data?.data.length ?? 0 > downsample);

  const [viewport, setViewport] = useState<{
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  }>();

  const [plotData, count, preDownsampledCount] = useMemo(() => {
    if (!data) return [];
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
    const outermostPoints = new Set([
      outermost.xMin,
      outermost.xMax,
      outermost.yMin,
      outermost.yMax,
    ]);

    let points = allPoints.filter((p) => !outermostPoints.has(p));

    if (viewport) {
      points = points.filter(
        ([x, y]) =>
          x >= viewport.xMin &&
          x <= viewport.xMax &&
          y >= viewport.yMin &&
          y <= viewport.yMax
      );
    }

    const preDownsampledCount = points.length + outermostPoints.size;

    if (shouldDownsample) {
      points = LTTB({
        series: points,
        threshold: Math.max(downsample - outermostPoints.size, 1),
      });
    }
    const extremePointArr = Array.from(outermostPoints);
    const x = [...points, ...extremePointArr].map(([x, y]) => x);
    const y = [...points, ...extremePointArr].map(([x, y]) => y);
    const plotData: ComponentProps<typeof Plot>['data'] = [
      { type: 'scattergl', mode: 'markers', x, y },
    ];
    return [plotData, x.length, preDownsampledCount];
  }, [data, downsample, shouldDownsample, viewport]);

  const debounceTimeout = useRef<number>();

  const title = `${xColumn} / ${yColumn}${
    shouldDownsample && preDownsampledCount !== count
      ? `<br>(downsampled to ${count}/${preDownsampledCount} points)`
      : ''
  }`;

  const [plotLayout, setPlotLayout] = useState<
    ComponentProps<typeof Plot>['layout']
  >({ width: 600, height: 600, title: title });

  //Reset title on plot update, but don't create a new layout object (this causes an infinite loop)
  useEffect(() => {
    plotLayout.title = {
      text: title,
      yref: 'paper',
    };
    setPlotLayout(plotLayout);
  }, [title, plotLayout]);

  if (!plotData || isFetching) return <Loader />;
  return (
    <Plot
      data={plotData}
      layout={plotLayout}
      onUpdate={({ layout }) => {
        setPlotLayout(layout);
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = window.setTimeout(() => {
          const bounds: (number | undefined)[] = [
            layout.xaxis?.range?.[0],
            layout.xaxis?.range?.[1],
            layout.yaxis?.range?.[0],
            layout.yaxis?.range?.[1],
          ];
          if (bounds.some((v) => v === undefined)) return;
          const [xMin, xMax, yMin, yMax] = bounds as number[];
          if (
            xMin !== viewport?.xMin ||
            xMax !== viewport?.xMax ||
            yMin !== viewport?.yMin ||
            yMax !== viewport?.yMax
          )
            setViewport({ xMin, xMax, yMin, yMax });
        }, 50);
      }}
    />
  );
};
