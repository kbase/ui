import { ComponentProps, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { getAttribHistogram } from '../../../common/api/collectionsApi';
import { Loader } from '../../../common/components/Loader';
import { useFilters } from '../collectionsSlice';
import { useTableViewParams } from './GenomeAttribs';

export const AttribHistogram = ({
  collection_id,
  column,
}: {
  collection_id: string;
  column: string;
}) => {
  const { filterMatch, filterSelection } = useFilters(collection_id);
  const viewParams = useTableViewParams(collection_id, {
    filtered: true,
    selected: Boolean(filterMatch),
    matched: Boolean(filterSelection),
  });
  const { data, isFetching } = getAttribHistogram.useQuery({
    ...viewParams,
    column,
  });
  const plotData: ComponentProps<typeof Plot>['data'] = useMemo(() => {
    if (!data) return [];
    const bins = data.bins ?? [];
    const values = data.values ?? [];
    const binStarts = bins.slice(0, -1);
    const binWidths = bins.slice(1).map((end, index) => end - bins[index]);
    return [{ type: 'bar', x: binStarts, width: binWidths, y: values }];
  }, [data]);
  if (!data || isFetching) return <Loader />;
  return (
    <Plot
      data={plotData}
      layout={{ height: 600, title: column }}
      config={{ responsive: true }}
    />
  );
};
