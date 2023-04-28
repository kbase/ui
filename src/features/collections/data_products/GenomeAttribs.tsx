import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  createColumnHelper,
  ColumnHelper,
  PaginationState,
  SortingState,
  RowSelectionState,
} from '@tanstack/react-table';
import { FC, useMemo, useState } from 'react';
import { getGenomeAttribs } from '../../../common/api/collectionsApi';
import { Table } from '../../../common/components/Table';
import { useAppDispatch, useAppSelector } from '../../../common/hooks';
import { useAppParam } from '../../params/hooks';
import { setUserSelection } from '../collectionsSlice';

export const GenomeAttribs: FC<{
  collection_id: string;
}> = ({ collection_id }) => {
  // Context
  const dispatch = useAppDispatch();

  // State Management
  const matchId = useAppParam('match');
  const [matchMark, setMatchMark] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const requestSort = useMemo(() => {
    return {
      by: sorting[0]?.id,
      desc: sorting[0]?.desc ?? true,
    };
  }, [sorting]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  });
  const currentSelection = useAppSelector(
    (state) => state.collections.selection.current
  );
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
        setUserSelection({
          selection: Object.entries(value)
            .filter(([k, v]) => v)
            .map(([k, v]) => k),
        })
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
      ...(matchId ? { match_id: matchId, match_mark: !matchMark } : {}),
    }),
    [
      collection_id,
      matchId,
      matchMark,
      pagination.pageIndex,
      pagination.pageSize,
      requestSort.by,
      requestSort.desc,
    ]
  );
  const { data, isFetching } = getGenomeAttribs.useQuery(attribParams);

  const countParams = useMemo(
    () => ({ ...attribParams, count: true }),
    [attribParams]
  );
  const { data: countData } = getGenomeAttribs.useQuery(countParams);

  // Table setup
  const matchIndex =
    data?.fields.findIndex((f) => f.name === '__match__') || -1;
  const idIndex = data?.fields.findIndex((f) => f.name === 'kbase_id') || -1;

  const columns = useAttribColumns(createColumnHelper(), {
    fieldNames: data?.fields.map((field) => field.name),
    order: ['kbase_id', 'genome_size'],
    exclude: ['__match__'],
  });

  const table = useReactTable<unknown[]>({
    data: data?.table || [],
    columns,
    getRowId: (row) => String(row[idIndex]),

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    manualSorting: true,
    onSortingChange: setSorting,

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
    <Table
      table={table}
      isLoading={isFetching}
      rowStyle={(row) => {
        if (matchIndex === -1) return {};
        return {
          background:
            matchIndex !== undefined && row.original[matchIndex]
              ? 'yellow'
              : undefined,
        };
      }}
    />
  );
};

const useAttribColumns = (
  colHelper: ColumnHelper<unknown[]>,
  {
    fieldNames = [],
    order = [],
    exclude = [],
  }: {
    fieldNames?: string[];
    order?: string[];
    exclude?: string[];
  }
) => {
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

  return useMemo(
    () =>
      fieldOrder.map((fieldName) =>
        colHelper.accessor(accessors[fieldName], {
          header: fieldName.replace(/_/g, ' ').trim(),
          id: fieldName,
        })
      ),
    // We only want to remake the columns if fieldNames or fieldOrder have new values
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(fieldNames), JSON.stringify(fieldOrder)]
  );
};
