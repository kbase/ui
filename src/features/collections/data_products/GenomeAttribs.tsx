import { FC, useCallback, useMemo } from 'react';
import { getGenomeAttribs } from '../../../common/api/collectionsApi';
import { Table, ColumnDefs } from '../../../common/components/Table';
import classes from './GenomeAttribs.module.scss';

export const GenomeAttribs: FC<{
  collection_id: string;
}> = ({ collection_id }) => {
  const attribParams = useMemo(() => ({ collection_id }), [collection_id]);
  const { data } = getGenomeAttribs.useQuery(attribParams);
  const colDefs = useAttribColumns({
    fieldNames: data?.fields.map((field) => field.name),
    order: ['genome_name', 'genome_size'],
  });
  if (data) {
    return (
      <Table
        className={classes['table']}
        data={data.table}
        pageSize={8}
        columnDefs={colDefs}
      />
    );
  }
  return null;
};

const useAttribColumns = ({
  fieldNames = [],
  order = [],
  exclude = [],
}: {
  fieldNames?: string[];
  order?: string[];
  exclude?: string[];
}): ColumnDefs<unknown[]> => {
  const accessors: {
    [fieldName: string]: <RowData extends unknown[]>(
      rowData: RowData
    ) => RowData[number];
  } = {};
  fieldNames.forEach((fieldName, index) => {
    accessors[fieldName] = (rowData) => rowData[index];
  });

  const fieldOrder = fieldNames
    .filter((name) => !exclude.includes(name))
    .sort((a, b) => {
      const aOrder = order.indexOf(a);
      const bOrder = order.indexOf(b);
      if (aOrder !== -1 && bOrder !== -1) {
        return aOrder - bOrder;
      } else if (aOrder !== -1) {
        return -1;
      } else if (bOrder !== -1) {
        return 1;
      } else {
        return fieldNames.indexOf(a) - fieldNames.indexOf(b);
      }
    });

  return useCallback(
    (columns) =>
      fieldOrder.map((fieldName) =>
        columns.accessor(accessors[fieldName], {
          header: fieldName.replace(/_/g, ' ').trim(),
        })
      ),
    // We only want to remake the columns if fieldNames or fieldOrder have new values
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(fieldNames), JSON.stringify(fieldOrder)]
  );
};
