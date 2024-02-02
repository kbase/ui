import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  PaginationState,
  createColumnHelper,
} from '@tanstack/react-table';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
  getBiolog,
  getBiologCell,
  getBiologMeta,
} from '../../../common/api/collectionsApi';
import { parseError } from '../../../common/api/utils/parseError';
import { Pagination, usePageBounds } from '../../../common/components/Table';
import { useAppDispatch, useBackoffPolling } from '../../../common/hooks';
import { useAppParam } from '../../params/hooks';
import { useSelectionId } from '../collectionsSlice';
import { HeatMap, MAX_HEATMAP_PAGE } from './HeatMap';
import { formatNumber } from '../../../common/utils/stringUtils';
import classes from './../Collections.module.scss';
import { Paper } from '@mui/material';

export const Biolog: FC<{
  collection_id: string;
}> = ({ collection_id }) => {
  const dispatch = useAppDispatch();
  const { table, count } = useBiolog(collection_id);
  const { firstRow, lastRow } = usePageBounds(table);

  return (
    <Paper variant="outlined">
      <div className={classes['table-toolbar']}>
        Showing {formatNumber(firstRow)} - {formatNumber(lastRow)} of{' '}
        {formatNumber(count?.count || 0)} genomes
      </div>
      <HeatMap
        table={table}
        rowNameAccessor={(row) => row.kbase_id}
        getCellLabel={async (cell, row, column) => {
          const { data, error } = await dispatch(
            getBiologCell.initiate({
              collection_id,
              cell_id: cell.cell_id,
            })
          );
          if (!data) {
            return (
              <>
                {'Error loading cell data:'}
                <br />
                {error ? parseError(error) : 'Unknown error'}
              </>
            );
          } else {
            return (
              <>
                Row: {row.kbase_id}
                <br />
                Col: {column.columnDef.header}
                <br />
                Val: {cell.val.toString()}
                <>
                  {Object.entries(row.meta as Record<string, string>).map(
                    ([id, val]) => (
                      <div key={id}>{`- ${id}:${val}`}</div>
                    )
                  )}
                </>
              </>
            );
          }
        }}
      />
      <div className={classes['pagination-wrapper']}>
        <Pagination table={table} maxPage={MAX_HEATMAP_PAGE} />
      </div>
    </Paper>
  );
};

const useBiolog = (collection_id: string | undefined) => {
  const matchId = useAppParam('match');
  const selId = useSelectionId(collection_id || '', {
    skip: !collection_id,
  });
  const [matchMark, setMatchMark] = useState<boolean>(true);
  const [selMark, setSelMark] = useState<boolean>(true);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 85,
  });

  const pageLastIdCache: Record<string, string> = useMemo(
    () => ({}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [collection_id, selMark, matchMark, pagination.pageSize]
  );

  const heatMapParams = useMemo(
    () => ({
      collection_id: collection_id ?? '',
      limit: pagination.pageSize,
      ...(pagination.pageIndex !== 0
        ? { start_after: pageLastIdCache[pagination.pageIndex - 1] }
        : {}),
      ...(matchId ? { match_id: matchId, match_mark: matchMark } : {}),
      ...(selId ? { selection_id: selId, selection_mark: selMark } : {}),
    }),
    [
      collection_id,
      matchId,
      matchMark,
      pageLastIdCache,
      pagination.pageIndex,
      pagination.pageSize,
      selId,
      selMark,
    ]
  );
  const countParams = useMemo(
    () => ({ ...heatMapParams, count: true }),
    [heatMapParams]
  );
  const metaParams = useMemo(
    () => ({ collection_id: collection_id ?? '' }),
    [collection_id]
  );

  const biologQuery = getBiolog.useQuery(heatMapParams, {
    skip: !collection_id,
  });
  const biolog = biologQuery.data;
  useBackoffPolling(
    biologQuery,
    (result) => {
      if (matchId && result?.data?.match_state === 'processing') return true;
      if (selId && result?.data?.selection_state === 'processing') return true;
      return false;
    },
    { skipPoll: !collection_id || !(matchId || selId) }
  );

  //cache last row of each page, we should implement better backend pagination this is silly
  useEffect(() => {
    if (!biologQuery.isFetching && biologQuery.data) {
      pageLastIdCache[pagination.pageIndex] =
        biologQuery.data.data[biologQuery.data.data.length - 1].kbase_id;
    }
  }, [
    biologQuery.data,
    pagination.pageIndex,
    biologQuery.isFetching,
    pageLastIdCache,
  ]);

  const { data: count, ...countQuery } = getBiolog.useQuery(countParams, {
    skip: !collection_id,
  });

  const { data: meta, ...metaQuery } = getBiologMeta.useQuery(metaParams, {
    skip: !collection_id,
  });

  type RowDatum = NonNullable<typeof biolog>['data'][number];

  const cols = createColumnHelper<RowDatum>();

  const colIndex = Object.fromEntries(
    meta?.categories
      .flatMap(({ columns }) => columns)
      .map((column, index) => [column.col_id, { index, column }]) || []
  );

  const normalize = useCallback(
    (
      value: NonNullable<typeof biolog>['data'][number]['cells'][number]['val'],
      type: NonNullable<
        typeof meta
      >['categories'][number]['columns'][number]['type']
    ): number => {
      const normVal = (v: number): number =>
        !meta ? 0 : (v - meta.min_value) / (meta.max_value - meta.min_value);
      if (type === 'float') {
        const v =
          typeof value === 'number' ? value : parseFloat(value.toString());
        return normVal(v);
      }
      if (type === 'int' || type === 'count') {
        const v =
          typeof value === 'number' ? value : parseInt(value.toString());
        return normVal(v);
      }
      return value ? 1 : 0;
    },
    [meta]
  );

  const table = useReactTable<RowDatum>({
    data: biolog?.data || [],
    getRowId: (row) => String(row.kbase_id),
    columns: useMemo(
      () =>
        (meta?.categories ?? []).slice(0, 30).map((category) => {
          return cols.group({
            id: category.category,
            header: category.category,
            columns: category.columns.map((col) =>
              cols.accessor(
                (row) => {
                  const column = colIndex[col.col_id];
                  const value = row.cells[column.index].val;
                  const type = column.column.type;
                  return normalize(value, type);
                },
                {
                  header: col.name,
                  id: col.col_id,
                  meta: col,
                }
              )
            ),
          });
        }),
      [colIndex, cols, normalize, meta]
    ),

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting: false,

    manualPagination: true,
    pageCount: Math.ceil((count?.count || 0) / pagination.pageSize),
    onPaginationChange: setPagination,

    enableRowSelection: false,

    state: {
      pagination,
    },
  });

  return {
    setMatchMark,
    setSelMark,
    setPagination,
    biolog,
    biologQuery,
    count,
    countQuery,
    meta,
    metaQuery,
    table,
  };
};
