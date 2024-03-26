import { ComponentProps, useEffect, useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { getAttribHistogram } from '../../../common/api/collectionsApi';
import { parseError } from '../../../common/api/utils/parseError';
import { Loader } from '../../../common/components/Loader';
import { useFilters } from '../collectionsSlice';
import { filterContextMode } from '../Filters';
import { useTableViewParams } from '../hooks';

export const AttribHistogram = ({
  collection_id,
  column,
  size,
}: {
  collection_id: string;
  column: string;
  size?: [width: number, height: number];
}) => {
  const { columnMeta, context, filterPanelOpen } = useFilters(collection_id);
  const viewParams = useTableViewParams(collection_id, {
    filtered: true,
    selected: filterContextMode(context) === 'selected',
    matched: filterContextMode(context) === 'matched',
  });
  const { data, isLoading, error } = getAttribHistogram.useQuery({
    ...viewParams,
    column,
  });

  // Controlled state for plot layout (so we can change the title dynamically)
  const [plotLayout, setPlotLayout] = useState<
    ComponentProps<typeof Plot>['layout']
  >({
    height: size?.[1],
    width: size?.[0],
    margin: { t: 80 },
    title: column,
    xaxis: { title: { text: columnMeta?.[column]?.display_name } },
    yaxis: { title: { text: 'Count' } },
  });

  const plotData: ComponentProps<typeof Plot>['data'] = useMemo(() => {
    if (!data) return [];
    const bins = data.bins ?? [];
    const values = data.values ?? [];
    const binStarts = bins.slice(0, -1);
    const binWidths = bins.slice(1).map((end, index) => end - bins[index]);
    return [{ type: 'bar', x: binStarts, width: binWidths, y: values }];
  }, [data]);

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
