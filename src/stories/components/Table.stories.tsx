import { ComponentMeta } from '@storybook/react';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';

import { Table } from '../../common/components/Table';
import { snakeCaseToHumanReadable } from '../../common/utils/stringUtils';

import rows from './tableData.json';

export default {
  title: 'Components/Table',
  component: Table,
  decorators: [
    (Story) => (
      <div style={{ height: '600px' }}>
        <Story />
      </div>
    ),
  ],
} as ComponentMeta<typeof Table>;

export const Default = () => {
  const columns = createColumnHelper<typeof rows[number]>();
  const table = useReactTable({
    data: rows,
    columns: Object.keys(rows[0]).map((k) =>
      columns.accessor((row) => row[k as keyof typeof row], {
        id: k,
        header: k,
      })
    ),
    // These options enable certain features in the table,
    // see the tanstack/table documentation
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: false,
  });

  return <Table table={table} />;
};

export const CustomizedColumns = () => {
  const columns = createColumnHelper<typeof rows[number]>();
  const table = useReactTable({
    data: rows,
    columns: [
      columns.accessor('genome_name', {
        id: '0',
        header: 'Genome Name (sort disabled)',
        enableSorting: false,
      }),
      columns.accessor('longest_contig', {
        id: '1',
        header: 'longest contig (custom cell render)',
        cell: (cell) => <strong>{cell.renderValue()} bp</strong>,
        sortingFn: 'alphanumeric',
      }),
      columns.accessor((rowDatum) => rowDatum['ncbi_date'], {
        id: '2',
        header: 'NCBI Date (custom sort, cell render)',
        cell: (cell) => new Date(cell.getValue()).toDateString(),
        sortingFn: (rowA, rowB, columnId) => {
          return (
            new Date(rowB.getValue(columnId)).getTime() -
            new Date(rowA.getValue(columnId)).getTime()
          );
        },
      }),
    ],
    // These options enable certain features in the table,
    // see the tanstack/table documentation
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: false,
  });

  return <Table table={table} />;
};

export const Footer = () => {
  const columns = createColumnHelper<typeof rows[number]>();
  const table = useReactTable({
    data: rows,
    columns: (Object.keys(rows[0]) as (keyof typeof rows[0])[])
      .slice(0, 6)
      .map((col) =>
        columns.accessor(col, {
          id: col,
          header: snakeCaseToHumanReadable(col),
          footer: col,
        })
      ),
    // These options enable certain features in the table,
    // see the tanstack/table documentation
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: false,
  });

  return <Table table={table} />;
};

export const ColumnGroup = () => {
  const columns = createColumnHelper<typeof rows[number]>();
  const table = useReactTable({
    data: rows,
    columns: [
      columns.accessor('genome_name', {
        header: 'Genome Name',
      }),
      columns.group({
        header: 'Scaffolds',
        footer: 'column group footer',
        columns: [
          columns.accessor('scaffold_count', {
            header: 'scaffold count',
            footer: 'some footer here',
          }),
          columns.accessor('longest_scaffold', {
            header: 'longest scaffold',
            footer: 'some other footer here',
          }),
        ],
      }),
    ],
    // These options enable certain features in the table,
    // see the tanstack/table documentation
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: false,
  });

  return <Table table={table} />;
};

export const NoHeader = () => {
  const columns = createColumnHelper<typeof rows[number]>();
  const table = useReactTable({
    data: rows,
    columns: (Object.keys(rows[0]) as (keyof typeof rows[0])[])
      .slice(0, 6)
      .map((col) =>
        columns.accessor(col, {
          // removes the default column header
          header: undefined,
        })
      ),
    // These options enable certain features in the table,
    // see the tanstack/table documentation
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: false,
  });

  return <Table table={table} />;
};

export const PageSize = () => {
  const columns = createColumnHelper<typeof rows[number]>();
  const table = useReactTable({
    data: rows,
    columns: (Object.keys(rows[0]) as (keyof typeof rows[0])[])
      .slice(0, 6)
      .map((col) =>
        columns.accessor(col, {
          header: col,
        })
      ),
    // These options enable certain features in the table,
    // see the tanstack/table documentation
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: false,
  });

  // Sets tanstack/table page size without controlling pagination,
  // see PaginatedWithQueriedData story for controlled behavior
  useEffect(() => {
    return table.setPageSize(6);
  }, [table]);

  return <Table table={table} />;
};

export const DisablePagination = () => {
  const columns = createColumnHelper<typeof rows[number]>();
  const table = useReactTable({
    data: rows,
    columns: (Object.keys(rows[0]) as (keyof typeof rows[0])[])
      .slice(0, 6)
      .map((col) =>
        columns.accessor(col, {
          header: col,
        })
      ),
    // These options enable certain features in the table,
    // see the tanstack/table documentation
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: false,
  });

  // This is the best way to play friendly with tanstack/table at
  // the moment while still disabling pagination
  useEffect(() => table.setPageSize(Number.MAX_SAFE_INTEGER), [table]);

  return <Table table={table} />;
};

const useMockDataQuery = (opts: {
  pageSize: number;
  pageIndex: number;
  sortBy?: string;
  sortDesc?: boolean;
}) => {
  const [fetching, setFetching] = useState(false);
  const [rowPart, setRowPart] = useState<typeof rows>([]);
  const [rowCount, setRowCount] = useState(-1);
  useEffect(() => {
    setFetching(true);
    new Promise((resolve) => setTimeout(resolve, 500)).then(() => {
      setFetching(false);
      const sortOrder = opts.sortDesc ? 1 : -1;
      setRowPart(
        [...rows]
          .sort((a, b) =>
            opts.sortBy
              ? a[opts.sortBy as keyof typeof rows[number]] >
                b[opts.sortBy as keyof typeof rows[number]]
                ? 1 * sortOrder
                : -1 * sortOrder
              : 0
          )
          .slice(
            opts.pageSize * opts.pageIndex,
            opts.pageSize * (opts.pageIndex + 1)
          )
      );
      setRowCount(rows.length);
    });
  }, [opts.pageSize, opts.pageIndex, opts.sortBy, opts.sortDesc]);
  return { result: { rows: rowPart, rowCount }, fetching };
};

export const ManualPaginationWithQueriedData = () => {
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 6,
  });
  const [sortingState, setSortingState] = useState<SortingState>([]);

  const {
    result: { rows, rowCount },
    fetching,
  } = useMockDataQuery({
    pageIndex: paginationState.pageIndex,
    pageSize: paginationState.pageSize,
    sortBy: (sortingState[0] || {})?.id,
    sortDesc: (sortingState[0] || {})?.desc,
  });

  const columns = createColumnHelper<typeof rows[number]>();
  const table = useReactTable({
    data: rows,
    columns: (Object.keys(rows[0] || {}) as (keyof typeof rows[0])[])
      .slice(0, 6)
      .map((col) =>
        columns.accessor(col, {
          header: snakeCaseToHumanReadable(col),
        })
      ),
    pageCount: Math.ceil(rowCount / paginationState.pageSize),
    onSortingChange: setSortingState,
    onPaginationChange: setPaginationState,
    manualPagination: true,
    state: {
      pagination: paginationState,
      sorting: sortingState,
    },

    // These options enable certain features in the table,
    // see the tanstack/table documentation
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: false,
  });

  return <Table table={table} isLoading={fetching} />;
};

export const Empty = () => {
  const table = useReactTable({
    data: [],
    columns: [],
    // These options enable certain features in the table,
    // see the tanstack/table documentation
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: false,
  });

  return <Table table={table} />;
};

export const EmptyWithDefinedColumns = () => {
  const columns = createColumnHelper<typeof rows[number]>();
  const table = useReactTable({
    data: [],
    columns: (Object.keys(rows[0] || []) as (keyof typeof rows[0])[])
      .slice(0, 6)
      .map((col) =>
        columns.accessor(col, {
          header: snakeCaseToHumanReadable(col),
        })
      ),
    // These options enable certain features in the table,
    // see the tanstack/table documentation
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: false,
  });

  return <Table table={table} />;
};

export const RowSelection = (testProps: {
  onSelectionChange?: (selection: string[]) => void;
}) => {
  const [selection, setSelection] = useState<RowSelectionState>({});
  const columns = createColumnHelper<typeof rows[number]>();
  const table = useReactTable({
    data: rows,
    columns: Object.keys(rows[0]).map((k) =>
      columns.accessor((row) => row[k as keyof typeof row], {
        id: k,
        header: k,
        footer: k,
      })
    ),

    state: {
      rowSelection: selection,
    },

    // These options enable certain features in the table,
    // see the tanstack/table documentation
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setSelection,
  });

  //for tests
  useEffect(() => {
    if (!testProps.onSelectionChange) return;
    testProps.onSelectionChange(
      Object.keys(selection).filter((k) => selection[k])
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  return <Table table={table} />;
};
