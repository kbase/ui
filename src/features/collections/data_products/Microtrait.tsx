import { Paper } from '@mui/material';
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  PaginationState,
  createColumnHelper,
} from '@tanstack/react-table';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
  getMicroTrait,
  getMicroTraitCell,
  getMicroTraitMeta,
} from '../../../common/api/collectionsApi';
import { parseError } from '../../../common/api/utils/parseError';
import { DataViewLink } from '../../../common/components';
import { Pagination, usePageBounds } from '../../../common/components/Table';
import { useAppDispatch } from '../../../common/hooks';
import { formatNumber } from '../../../common/utils/stringUtils';
import classes from '../Collections.module.scss';
import {
  useMatchId,
  useGenerateSelectionId,
  useFilterContextState,
  useFilters,
} from '../collectionsSlice';
import { useFilterContexts } from '../Filters';
import { useProcessStatePolling } from '../hooks';
import { HeatMap, HeatMapCallback, MAX_HEATMAP_PAGE } from './HeatMap';

const getUPAFromEncoded = (encoded: string) => encoded.replaceAll('_', '/');

export const Microtrait: FC<{
  collection_id: string;
}> = ({ collection_id }) => {
  const dispatch = useAppDispatch();
  const { table, count } = useMicrotrait(collection_id);
  const { firstRow, lastRow } = usePageBounds(table);

  /* see also Biolog.getCellLabel */
  const getCellLabel: HeatMapCallback['getCellLabel'] = async (
    cell,
    row,
    column
  ) => {
    let response: {
      data?: { values: { id: string; val: number | boolean }[] };
      error?: unknown;
    } = {};
    try {
      response = await dispatch(
        getMicroTraitCell.initiate({
          collection_id,
          cell_id: cell.cell_id,
        })
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error getting MicroTraitCell data.');
      return <></>;
    }
    const { data, error } = response;
    if (!data) {
      return (
        <>
          {'Error loading cell data:'}
          <br />
          {error ? JSON.stringify(parseError(error)) : 'Unknown error'}
        </>
      );
    } else {
      return (
        <>
          <table>
            <tr>
              <th>KBase ID</th>
              <td>
                (
                <DataViewLink identifier={getUPAFromEncoded(row.kbase_id)}>
                  {getUPAFromEncoded(row.kbase_id)}
                </DataViewLink>
                ) {row.kbase_display_name}
              </td>
            </tr>
            <tr>
              <th>Trait</th>
              <td>{`${column.columnDef.header}`}</td>
            </tr>
            <tr>
              <td colSpan={2}>
                <hr />
              </td>
            </tr>
            <tr>
              <th>Type</th>
              <td>{column.columnDef.meta?.type}</td>
            </tr>
            <tr>
              <th>Value</th>
              <td> {`${cell.val}`}</td>
            </tr>
            {data.values.length > 0 ? (
              <>
                <tr>
                  <td colSpan={2}>
                    <hr />
                  </td>
                </tr>
                <tr>
                  <th>Genes Detected</th>
                  <th>
                    <abbr title="Trusted Cutoff">TC</abbr> value
                  </th>
                </tr>
                <>
                  {data.values.map(({ id, val }) => (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>{val}</td>
                    </tr>
                  ))}
                </>
              </>
            ) : (
              <></>
            )}
          </table>
        </>
      );
    }
  };
  return (
    <Paper variant="outlined">
      <div className={classes['table-toolbar']}>
        Showing {formatNumber(firstRow)} - {formatNumber(lastRow)} of{' '}
        {formatNumber(count?.count || 0)} genomes
      </div>
      <HeatMap table={table} getCellLabel={getCellLabel} />
      <div className={classes['pagination-wrapper']}>
        <Pagination table={table} maxPage={MAX_HEATMAP_PAGE} />
      </div>
    </Paper>
  );
};

const useMicrotrait = (collection_id: string | undefined) => {
  const matchId = useMatchId(collection_id);
  const selId = useGenerateSelectionId(collection_id || '', {
    skip: !collection_id,
  });
  const context = useFilterContextState(collection_id);
  const { filterParams } = useFilters(collection_id, context);
  const allFilters = useFilters(collection_id, 'biolog.all').filterParams;
  const matchFilters = useFilters(collection_id, 'biolog.matched').filterParams;
  const selFilters = useFilters(collection_id, 'biolog.selected').filterParams;

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });

  const pageLastIdCache: Record<string, string> = useMemo(
    () => ({}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [collection_id, context, pagination.pageSize]
  );

  const heatMapParams = useMemo(
    () => ({
      collection_id: collection_id ?? '',
      limit: pagination.pageSize,
      match_mark: !context.endsWith('.matched'),
      selection_mark: !context.endsWith('.selected'),
      ...(pagination.pageIndex !== 0
        ? { start_after: pageLastIdCache[pagination.pageIndex - 1] }
        : {}),
      ...(matchId ? { match_id: matchId } : {}),
      ...(selId ? { selection_id: selId } : {}),
    }),
    [
      collection_id,
      matchId,
      pageLastIdCache,
      pagination.pageIndex,
      pagination.pageSize,
      selId,
      context,
    ]
  );
  const countParams = useMemo(
    () => ({
      ...heatMapParams,
      count: true,
      match_mark: true,
      selection_mark: true,
    }),
    [heatMapParams]
  );
  const metaParams = useMemo(
    () => ({ collection_id: collection_id ?? '' }),
    [collection_id]
  );

  // HeatMap cell query
  const filteredParams = useMemo(
    () => ({
      ...heatMapParams,
      ...filterParams,
    }),
    [heatMapParams, filterParams]
  );
  const microtraitQuery = getMicroTrait.useQuery(filteredParams, {
    skip: !collection_id,
  });
  const microtrait = microtraitQuery.data;
  useProcessStatePolling(microtraitQuery, ['match_state', 'selection_state'], {
    skipPoll: !collection_id || !(matchId || selId),
  });

  // Reload on context change
  useEffect(() => {
    microtraitQuery.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  //cache last row of each page, we should implement better backend pagination this is silly
  useEffect(() => {
    if (!microtraitQuery.isFetching && microtraitQuery.data) {
      const name =
        microtraitQuery.data.data[microtraitQuery.data.data.length - 1]
          ?.kbase_display_name;
      if (name) pageLastIdCache[pagination.pageIndex] = name;
    }
  }, [
    microtraitQuery.data,
    pagination.pageIndex,
    microtraitQuery.isFetching,
    pageLastIdCache,
  ]);

  const { data: meta, ...metaQuery } = getMicroTraitMeta.useQuery(metaParams, {
    skip: !collection_id,
  });

  const [allCountParams, matchCountParams, selCountParams] = useMemo(
    () => [
      {
        ...countParams,
        ...allFilters,
      },
      {
        ...countParams,
        match_mark: false,
        ...matchFilters,
      },
      {
        ...countParams,
        selection_mark: false,
        ...selFilters,
      },
    ],
    [allFilters, countParams, matchFilters, selFilters]
  );

  const { data: count, ...countQuery } = getMicroTrait.useQuery(
    allCountParams,
    {
      skip: !collection_id,
    }
  );

  const matchCount = getMicroTrait.useQuery(matchCountParams, {
    skip: !collection_id || !matchId,
  });

  const { match_state } = useProcessStatePolling(matchCount, ['match_state'], {
    skipPoll: !collection_id || !matchId,
  });

  const selCount = getMicroTrait.useQuery(selCountParams, {
    skip: !collection_id || !selId,
  });

  const { selection_state } = useProcessStatePolling(
    selCount,
    ['selection_state'],
    {
      skipPoll: !collection_id || !selId,
    }
  );

  useFilterContexts(collection_id || '', [
    {
      label: 'All',
      value: 'microtrait.all',
      count: count?.count,
    },
    {
      label: 'Matched',
      value: 'microtrait.matched',
      count: heatMapParams.match_id ? matchCount?.data?.count : undefined,
      disabled: !heatMapParams.match_id || matchCount?.data?.count === 0,
      loading:
        (heatMapParams.match_id && !match_state) ||
        match_state === 'processing',
    },
    {
      label: 'Selected',
      value: 'microtrait.selected',
      count: heatMapParams.selection_id ? selCount?.data?.count : undefined,
      disabled: !heatMapParams.selection_id || selCount?.data?.count === 0,
      loading:
        (heatMapParams.selection_id && !selection_state) ||
        selection_state === 'processing',
    },
  ]);

  type RowDatum = NonNullable<typeof microtrait>['data'][number];

  const cols = createColumnHelper<RowDatum>();

  const colIndex = Object.fromEntries(
    meta?.categories
      .flatMap(({ columns }) => columns)
      .map((column, index) => [column.col_id, { index, column }]) || []
  );

  const normalize = useCallback(
    (
      value: NonNullable<
        typeof microtrait
      >['data'][number]['cells'][number]['val'],
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
    data: microtrait?.data || [],
    getRowId: (row) => String(row.kbase_display_name),
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
    setPagination,
    microtrait,
    microtraitQuery,
    count,
    countQuery,
    meta,
    metaQuery,
    table,
  };
};
