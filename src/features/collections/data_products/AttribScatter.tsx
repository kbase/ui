import { ComponentProps, useMemo, useRef, useState } from 'react';
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
  const [plotLayout, setPlotLayout] = useState<
    ComponentProps<typeof Plot>['layout']
  >({ width: 600, height: 600, title: `${xColumn} / ${yColumn}` });

  const { data, isFetching } = getAttribScatter.useQuery({
    collection_id,
    xcolumn: xColumn,
    ycolumn: yColumn,
  });

  const [{ xMin, xMax, yMin, yMax }, setExtent] = useState<{
    xMin?: number;
    xMax?: number;
    yMin?: number;
    yMax?: number;
  }>({});

  const plotData: ComponentProps<typeof Plot>['data'] = useMemo(() => {
    if (!data) return [];
    const allPoints = data.data.map(({ x, y }) => [x, y]);
    // Find the most extreme points. for auto-zoom purposes, we always want to plot these
    const ex = allPoints.reduce(
      (ex, point) => {
        if (point[0] < ex.xMin[0]) ex.xMin = point;
        if (point[0] > ex.xMax[0]) ex.xMax = point;
        if (point[1] < ex.yMin[1]) ex.yMin = point;
        if (point[1] > ex.yMax[1]) ex.yMax = point;
        return ex;
      },
      {
        xMin: [Infinity, 0],
        xMax: [-Infinity, 0],
        yMin: [0, Infinity],
        yMax: [0, -Infinity],
      }
    );
    const extremities = new Set([ex.xMin, ex.xMax, ex.yMin, ex.yMax]);
    const extremePoints = Array.from(extremities);

    let points = allPoints.filter((p) => !extremities.has(p));

    if (xMin && xMax && yMin && yMax) {
      points = points.filter(
        ([x, y]) => x >= xMin && x <= xMax && y >= yMin && y <= yMax
      );
    }
    if (downsample && downsample - extremePoints.length > 0) {
      points = LTTB({
        series: points,
        threshold: downsample - extremePoints.length,
      });
    }
    const x = [...points, ...extremePoints].map(([x, y]) => x);
    const y = [...points, ...extremePoints].map(([x, y]) => y);
    const plotData: ComponentProps<typeof Plot>['data'] = [
      { type: 'scattergl', mode: 'markers', x, y },
    ];
    return plotData;
  }, [data, downsample, xMax, xMin, yMax, yMin]);

  const debounceTimeout = useRef<number>();

  if (!plotData || isFetching) return <Loader />;
  return (
    <Plot
      data={plotData}
      layout={plotLayout}
      onUpdate={({ layout }) => {
        setPlotLayout(layout);
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = window.setTimeout(() => {
          const xMin = layout.xaxis?.range?.[0];
          const xMax = layout.xaxis?.range?.[1];
          const yMin = layout.yaxis?.range?.[0];
          const yMax = layout.yaxis?.range?.[1];
          setExtent({ xMin, xMax, yMin, yMax });
        }, 50);
      }}
    />
  );
};
