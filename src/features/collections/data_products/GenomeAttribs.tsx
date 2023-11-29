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
  useTableColumns,
} from '../../../common/components/Table';
import { useAppDispatch } from '../../../common/hooks';
import { useAppParam } from '../../params/hooks';
import {
  setLocalSelection,
  useCurrentSelection,
  useSelectionId,
} from '../collectionsSlice';
import classes from './../Collections.module.scss';

export const GenomeAttribs: FC<{
  collection_id: string;
}> = ({ collection_id }) => {
  // Context
  const dispatch = useAppDispatch();

  // State Management
  const matchId = useAppParam('match');
  const [matchMark, setMatchMark] = useState(true);
  const [selectMark, setSelectMark] = useState(true);
  // we don't use the server marks to show the selected state,
  // so no need to fetch the selection unless we are filtering the table
  const selectionId = useSelectionId(collection_id, { skip: selectMark });

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

  // Requests
  const attribParams = useMemo(
    () => ({
      collection_id,
      sort_on: requestSort.by,
      sort_desc: requestSort.desc,
      skip: pagination.pageIndex * pagination.pageSize,
      limit: pagination.pageSize,
      ...(matchId ? { match_id: matchId, match_mark: matchMark } : {}),
      ...(selectionId
        ? { selection_id: selectionId, selection_mark: selectMark }
        : {}),
    }),
    [
      collection_id,
      matchId,
      matchMark,
      selectionId,
      selectMark,
      pagination.pageIndex,
      pagination.pageSize,
      requestSort.by,
      requestSort.desc,
    ]
  );
  const countParams = useMemo(
    () => ({ ...attribParams, count: true }),
    [attribParams]
  );
  // Current Data
  const { data, isFetching } = getGenomeAttribs.useQuery(attribParams);
  const { data: countData } = getGenomeAttribs.useQuery(countParams);

  // Prefetch requests
  const nextParams = useMemo(
    () => ({
      ...attribParams,
      skip: Math.min(
        (countData?.count || pagination.pageSize) - pagination.pageSize,
        attribParams.skip + pagination.pageSize
      ),
    }),
    [attribParams, countData?.count, pagination.pageSize]
  );
  getGenomeAttribs.useQuery(nextParams, {
    skip: !data || !countData || isFetching,
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
      fieldNames: data?.fields.map((field) => field.name),
      order: ['kbase_id', 'genome_size'],
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
    pageCount: Math.ceil((countData?.count || 0) / pagination.pageSize),
    onPaginationChange: setPagination,

    enableRowSelection: true,
    onRowSelectionChange: setSelection,

    state: {
      sorting,
      pagination,
      rowSelection: selection,
    },
  });

  return (
    <div>
      <span>
        <CheckBox
          checked={matchMark}
          onChange={() => setMatchMark((v) => !v)}
        />{' '}
        Show Unmatched
      </span>

      <span>
        <CheckBox
          checked={selectMark}
          onChange={() => setSelectMark((v) => !v)}
        />{' '}
        Show Unselected
      </span>

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

      <Pagination table={table} maxPage={10000 / pagination.pageSize} />
    </div>
  );
};
