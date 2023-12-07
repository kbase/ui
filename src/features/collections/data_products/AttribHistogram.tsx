import { ComponentProps, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { getAttribHistogram } from '../../../common/api/collectionsApi';
import { Loader } from '../../../common/components/Loader';

export const AttribHistogram = ({
  collection_id,
  column,
}: {
  collection_id: string;
  column: string;
}) => {
  const { data, isFetching } = getAttribHistogram.useQuery({
    collection_id,
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
    <Plot data={plotData} layout={{ width: 600, height: 600, title: column }} />
  );
};
