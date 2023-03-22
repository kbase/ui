import { FC, useCallback, useMemo, useState } from 'react';
import { getGenomeAttribs } from '../../../common/api/collectionsApi';
import { Table, ColumnDefs } from '../../../common/components/Table';
import { useAppParam } from '../../params/hooks';
import classes from './GenomeAttribs.module.scss';

export const GenomeAttribs: FC<{
  collection_id: string;
}> = ({ collection_id }) => {
  const matchId = useAppParam('match');
  const [onlyMatch, setOnlyMatch] = useState(false);

  const [tableState, setTableState] = useState<{
    sortBy?: string;
    sortDesc: boolean;
    pageIndex: number;
    pageSize: number;
  }>({ sortDesc: false, pageIndex: 0, pageSize: 8 });

  const attribParams = useMemo(
    () => ({
      collection_id,
      sort_on: tableState.sortBy,
      sort_desc: tableState.sortDesc,
      skip: tableState.pageIndex * tableState.pageSize,
      limit: tableState.pageSize,
      ...(matchId ? { match_id: matchId, match_mark: !onlyMatch } : {}),
    }),
    [collection_id, matchId, onlyMatch, tableState]
  );
  const { data, isFetching } = getGenomeAttribs.useQuery(attribParams);

  const countParams = useMemo(
    // get the count for either matched or total, depending on match_mark
    () => ({
      ...attribParams,
      count: true,
      match_id:
        attribParams.match_id && attribParams.match_mark
          ? undefined
          : attribParams.match_id,
    }),
    [attribParams]
  );
  const { data: countData } = getGenomeAttribs.useQuery(countParams);

  const colDefs = useAttribColumns({
    fieldNames: data?.fields.map((field) => field.name),
    order: ['genome_name', 'genome_size'],
    exclude: ['__match__'],
  });

  if (data) {
    const matchIndex = data.fields.findIndex((f) => f.name === '__match__');
    const pageCount = Math.ceil((countData?.count || 0) / tableState.pageSize);
    return (
      <>
        {matchId ? (
          <button onClick={() => setOnlyMatch((d) => !d)}>
            {!onlyMatch ? 'View Only Matched' : 'View All'}
          </button>
        ) : null}
        <Table
          showLoader={isFetching}
          className={classes['table']}
          data={data.table}
          pageSize={tableState.pageSize}
          pageCount={pageCount}
          maxPage={Math.floor(10000 / tableState.pageSize)}
          columnDefs={colDefs}
          onTableChange={(state) => setTableState(state)}
          rowStyle={(row) => {
            if (matchIndex === -1) return {};
            return {
              background: row.original[matchIndex] ? 'yellow' : undefined,
            };
          }}
        />
      </>
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
