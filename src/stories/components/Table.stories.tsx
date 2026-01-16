import type { Meta, StoryObj } from '@storybook/react';
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

import { Table, Pagination } from '../../common/components/Table';
import { snakeCaseToHumanReadable } from '../../common/utils/stringUtils';

import rows from './tableData.json';

const meta: Meta<typeof Table> = {
  title: 'Components/Table',
  component: Table,
  decorators: [
    (Story) => (
      <div style={{ height: '600px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Exported for testing
export const DefaultDemo = () => {
  const columns = createColumnHelper<(typeof rows)[number]>();
  const table = useReactTable({
    data: rows,
    columns: Object.keys(rows[0]).map((k) =>
      columns.accessor((row) => row[k as keyof typeof row], {
        id: k,
        header: k,
      })
    ),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: false,
  });

  return <Table table={table} />;
};

export const Default: Story = {
  render: () => <DefaultDemo />,
};

// Exported for testing
export const CustomizedColumnsDemo = () => {
  const columns = createColumnHelper<(typeof rows)[number]>();
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
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: false,
  });

  return <Table table={table} />;
};

export const CustomizedColumns: Story = {
  render: () => <CustomizedColumnsDemo />,
};

export const FooterDemo = () => {
  const columns = createColumnHelper<(typeof rows)[number]>();
  const table = useReactTable({
    data: rows,
    columns: (Object.keys(rows[0]) as (keyof (typeof rows)[0])[])
      .slice(0, 6)
      .map((col) =>
        columns.accessor(col, {
          id: col,
          header: snakeCaseToHumanReadable(col),
          footer: col,
        })
      ),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: false,
  });

  return <Table table={table} />;
};

export const Footer: Story = {
  render: () => <FooterDemo />,
};

export const ColumnGroupDemo = () => {
  const columns = createColumnHelper<(typeof rows)[number]>();
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
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: false,
  });

  return <Table table={table} />;
};

export const ColumnGroup: Story = {
  render: () => <ColumnGroupDemo />,
};

export const NoHeaderDemo = () => {
  const columns = createColumnHelper<(typeof rows)[number]>();
  const table = useReactTable({
    data: rows,
    columns: (Object.keys(rows[0]) as (keyof (typeof rows)[0])[])
      .slice(0, 6)
      .map((col) =>
        columns.accessor(col, {
          header: undefined,
        })
      ),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: false,
  });

  return <Table table={table} />;
};

export const NoHeader: Story = {
  render: () => <NoHeaderDemo />,
};

export const PageSizeDemo = () => {
  const columns = createColumnHelper<(typeof rows)[number]>();
  const table = useReactTable({
    data: rows,
    columns: (Object.keys(rows[0]) as (keyof (typeof rows)[0])[])
      .slice(0, 6)
      .map((col) =>
        columns.accessor(col, {
          header: col,
        })
      ),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: false,
  });

  useEffect(() => {
    return table.setPageSize(6);
  }, [table]);

  return (
    <>
      <Table table={table} />
      <Pagination table={table} maxPage={10000} />
    </>
  );
};

export const PageSize: Story = {
  render: () => <PageSizeDemo />,
};

const DisablePaginationDemo = () => {
  const columns = createColumnHelper<(typeof rows)[number]>();
  const table = useReactTable({
    data: rows,
    columns: (Object.keys(rows[0]) as (keyof (typeof rows)[0])[])
      .slice(0, 6)
      .map((col) =>
        columns.accessor(col, {
          header: col,
        })
      ),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: false,
  });

  useEffect(() => table.setPageSize(Number.MAX_SAFE_INTEGER), [table]);

  return <Table table={table} />;
};

export const DisablePagination: Story = {
  render: () => <DisablePaginationDemo />,
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
              ? a[opts.sortBy as keyof (typeof rows)[number]] >
                b[opts.sortBy as keyof (typeof rows)[number]]
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

const ManualPaginationWithQueriedDataDemo = () => {
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

  const columns = createColumnHelper<(typeof rows)[number]>();
  const table = useReactTable({
    data: rows,
    columns: (Object.keys(rows[0] || {}) as (keyof (typeof rows)[0])[])
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
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: false,
  });

  return <Table table={table} isLoading={fetching} />;
};

export const ManualPaginationWithQueriedData: Story = {
  render: () => <ManualPaginationWithQueriedDataDemo />,
};

const EmptyDemo = () => {
  const table = useReactTable({
    data: [],
    columns: [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: false,
  });

  return <Table table={table} />;
};

export const Empty: Story = {
  render: () => <EmptyDemo />,
};

const EmptyWithDefinedColumnsDemo = () => {
  const columns = createColumnHelper<(typeof rows)[number]>();
  const table = useReactTable({
    data: [],
    columns: (Object.keys(rows[0] || []) as (keyof (typeof rows)[0])[])
      .slice(0, 6)
      .map((col) =>
        columns.accessor(col, {
          header: snakeCaseToHumanReadable(col),
        })
      ),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: false,
  });

  return <Table table={table} />;
};

export const EmptyWithDefinedColumns: Story = {
  render: () => <EmptyWithDefinedColumnsDemo />,
};

export const RowSelectionDemo = (testProps: {
  onSelectionChange?: (selection: string[]) => void;
}) => {
  const [selection, setSelection] = useState<RowSelectionState>({});
  const columns = createColumnHelper<(typeof rows)[number]>();
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

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setSelection,
  });

  useEffect(() => {
    if (!testProps.onSelectionChange) return;
    testProps.onSelectionChange(
      Object.keys(selection).filter((k) => selection[k])
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  return <Table table={table} />;
};

export const RowSelection: Story = {
  render: (_, { args }) => (
    <RowSelectionDemo
      onSelectionChange={
        (args as { onSelectionChange?: (selection: string[]) => void })
          .onSelectionChange
      }
    />
  ),
};
