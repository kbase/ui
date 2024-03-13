import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
  SortingState,
  RowSelectionState,
} from '@tanstack/react-table';
import { FC, useMemo, useState } from 'react';
import { getGenomeAttribs } from '../../../common/api/collectionsApi';
import { CheckBox } from '../../../common/components/CheckBox';
import {
  Pagination,
  Table,
  usePageBounds,
  useTableColumns,
} from '../../../common/components/Table';
import { useAppDispatch } from '../../../common/hooks';
import {
  setFilterMatch,
  setFilterSelection,
  setLocalSelection,
  useCurrentSelection,
  useFilters,
  useGenerateSelectionId,
  useMatchId,
  useSelectionId,
} from '../collectionsSlice';
import classes from './../Collections.module.scss';
import { AttribHistogram } from './AttribHistogram';
import { AttribScatter } from './AttribScatter';
import { Paper, Stack } from '@mui/material';
import { formatNumber } from '../../../common/utils/stringUtils';

export const GenomeAttribs: FC<{
  collection_id: string;
}> = ({ collection_id }) => {
  // Context
  const dispatch = useAppDispatch();

  // State Management
  const matchId = useMatchId(collection_id);
  const selectionId = useSelectionId(collection_id);
  // get the shared filter state
  const { filterMatch, filterSelection, columnMeta } =
    useFilters(collection_id);

  const [sorting, setSorting] = useState<SortingState>([]);
  const requestSort = useMemo(() => {
    return {
      by: sorting[0]?.id,
      desc: sorting[0]?.desc ?? true,
    };
  }, [sorting]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const currentSelection = useCurrentSelection(collection_id);
  const [selection, setSelection] = [
    useMemo(
      () => Object.fromEntries(currentSelection.map((k) => [k, true])),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [[...currentSelection].sort().join(', ')]
    ),
    (
      updaterOrValue:
        | RowSelectionState
        | ((old: RowSelectionState) => RowSelectionState)
    ) => {
      const value =
        typeof updaterOrValue == 'function'
          ? updaterOrValue(selection)
          : updaterOrValue;
      dispatch(
        setLocalSelection([
          collection_id,
          Object.entries(value)
            .filter(([k, v]) => v)
            .map(([k, v]) => k),
        ])
      );
    },
  ];

  const view = useMemo(
    () => ({
      matched: Boolean(matchId && filterMatch),
      selected: Boolean(selectionId && filterSelection),
      filtered: true,
    }),
    [filterMatch, filterSelection, matchId, selectionId]
  );
  const viewParams = useTableViewParams(collection_id, view);

  const markParams = useMemo(
    () => ({
      match_mark: Boolean(matchId && !filterMatch),
      selection_mark: Boolean(selectionId && !filterSelection),
      match_id: matchId ?? undefined,
      sel_id: selectionId ?? undefined,
    }),
    [filterMatch, filterSelection, matchId, selectionId]
  );
  // Requests
  const attribParams = useMemo(
    () => ({
      ...viewParams,
      ...markParams,
      // sort params
      sort_on: requestSort.by,
      sort_desc: requestSort.desc,
      // pagination params
      skip: pagination.pageIndex * pagination.pageSize,
      limit: pagination.pageSize,
    }),
    [
      viewParams,
      markParams,
      requestSort.by,
      requestSort.desc,
      pagination.pageIndex,
      pagination.pageSize,
    ]
  );

  // Current Data
  const { data, isFetching } = getGenomeAttribs.useQuery(attribParams);
  const { count } = useGenomeAttribsCount(collection_id, view);

  // Prefetch requests
  const nextParams = useMemo(
    () => ({
      ...attribParams,
      skip: Math.min(
        (count || pagination.pageSize) - pagination.pageSize,
        attribParams.skip + pagination.pageSize
      ),
    }),
    [attribParams, count, pagination.pageSize]
  );
  getGenomeAttribs.useQuery(nextParams, {
    skip: !data || count === undefined || isFetching,
  });
  const prevParams = useMemo(
    () => ({
      ...attribParams,
      skip: Math.max(0, attribParams.skip - pagination.pageSize),
    }),
    [attribParams, pagination.pageSize]
  );
  getGenomeAttribs.useQuery(prevParams, {
    skip: !data || isFetching,
  });

  // Table setup
  const matchIndex =
    data?.fields.findIndex((f) => f.name === '__match__') ?? -1;
  const idIndex = data?.fields.findIndex((f) => f.name === 'kbase_id') ?? -1;

  const table = useReactTable<unknown[]>({
    data: data?.table || [],
    getRowId: (row) => String(row[idIndex]),
    columns: useTableColumns({
      fields: data?.fields.map((field) => ({
        id: field.name,
        displayName: columnMeta?.[field.name]?.display_name ?? field.name,
        options: {
          textAlign: ['float', 'int'].includes(
            columnMeta?.[field.name]?.type ?? ''
          )
            ? 'right'
            : 'left',
          type: columnMeta?.[field.name]?.type ?? '',
        },
      })),
      order: ['kbase_display_name', 'genome_size'],
      exclude: ['__match__', '__sel__'],
    }),

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    manualSorting: true,
    onSortingChange: (update) => {
      setPagination((pgn) => ({ ...pgn, pageIndex: 0 }));
      setSorting(update);
    },
    manualPagination: true,
    pageCount: Math.ceil((count || 0) / pagination.pageSize),
    onPaginationChange: setPagination,

    enableRowSelection: true,
    onRowSelectionChange: setSelection,

    state: {
      sorting,
      pagination,
      rowSelection: selection,
    },
  });

  const { firstRow, lastRow } = usePageBounds(table);

  return (
    <Stack spacing={1}>
      <Paper variant="outlined">
        <Stack className={classes['table-toolbar']} direction="row" spacing={1}>
          <span>
            Showing {formatNumber(firstRow)} - {formatNumber(lastRow)} of{' '}
            {formatNumber(count || 0)} genomes
          </span>
          <span>
            <CheckBox
              checked={Boolean(filterMatch)}
              onChange={(e) =>
                dispatch(
                  setFilterMatch([collection_id, e.currentTarget.checked])
                )
              }
            />{' '}
            Filter by Match
          </span>
          <span>
            <CheckBox
              checked={Boolean(filterSelection)}
              onChange={(e) =>
                dispatch(
                  setFilterSelection([collection_id, e.currentTarget.checked])
                )
              }
            />{' '}
            Filter by Selection
          </span>
        </Stack>
        <Table
          table={table}
          isLoading={isFetching}
          rowClass={(row) => {
            // match highlights
            return matchIndex !== undefined &&
              matchIndex !== -1 &&
              row.original[matchIndex]
              ? classes['match-highlight']
              : '';
          }}
        />
        <div className={classes['pagination-wrapper']}>
          <Pagination table={table} maxPage={10000 / pagination.pageSize} />
        </div>
      </Paper>
      <Stack direction={'row'} spacing={1}>
        <Paper variant="outlined">
          <AttribScatter
            collection_id={collection_id}
            xColumn={
              collection_id === 'GTDB' ? 'checkm_completeness' : 'Completeness'
            }
            yColumn={
              collection_id === 'GTDB'
                ? 'checkm_contamination'
                : 'Contamination'
            }
          />
        </Paper>
        <Paper variant="outlined">
          <AttribHistogram
            collection_id={collection_id}
            column={
              collection_id === 'GTDB' ? 'checkm_completeness' : 'Completeness'
            }
          />
        </Paper>
      </Stack>
    </Stack>
  );
};

export const useTableViewParams = (
  collection_id: string | undefined,
  view: { filtered: boolean; selected: boolean; matched: boolean }
) => {
  const { filterParams } = useFilters(collection_id);
  const matchId = useMatchId(collection_id);
  const selectionId = useGenerateSelectionId(collection_id || '', {
    skip: !collection_id,
  });
  return useMemo(
    () => ({
      collection_id: collection_id ?? '',
      ...(view.filtered ? { ...filterParams } : {}),
      ...(view.selected ? { selection_id: selectionId } : {}),
      ...(view.matched ? { match_id: matchId } : {}),
    }),
    [
      collection_id,
      filterParams,
      matchId,
      selectionId,
      view.filtered,
      view.matched,
      view.selected,
    ]
  );
};

export const useGenomeAttribsCount = (
  collection_id: string | undefined,
  view: { filtered: boolean; selected: boolean; matched: boolean }
) => {
  const viewParams = useTableViewParams(collection_id, view);
  const params = useMemo(() => ({ ...viewParams, count: true }), [viewParams]);

  // Requests
  const result = getGenomeAttribs.useQuery(params, {
    skip: !collection_id,
  });

  return { count: result?.currentData?.count, result };
};
