import { ComponentMeta } from '@storybook/react';
import { ComponentProps, useEffect, useState } from 'react';

import { OldTable } from '../../common/components/Table';
import { snakeCaseToHumanReadable } from '../../common/utils/stringUtils';

import rows from './tableData.json';

export default {
  title: 'Components/Table',
  component: OldTable,
  decorators: [
    (Story) => (
      <div style={{ height: '600px' }}>
        <Story />
      </div>
    ),
  ],
} as ComponentMeta<typeof OldTable>;

export const Default = () => <OldTable data={rows} />;

export const CustomizedColumns = () => (
  <OldTable
    data={rows}
    columnDefs={(columns) => [
      columns.accessor('genome_name', {
        header: 'Genome Name (sort disabled)',
        enableSorting: false,
      }),
      columns.accessor('longest_contig', {
        header: 'longest contig (custom cell render)',
        cell: (cell) => <strong>{cell.renderValue()} bp</strong>,
        sortingFn: 'alphanumeric',
      }),
      columns.accessor((rowDatum) => rowDatum['ncbi_date'], {
        header: 'NCBI Date (custom sort, cell render)',
        cell: (cell) => new Date(cell.getValue()).toDateString(),
        sortingFn: (rowA, rowB, columnId) => {
          return (
            new Date(rowB.getValue(columnId)).getTime() -
            new Date(rowA.getValue(columnId)).getTime()
          );
        },
      }),
    ]}
  />
);

export const Footer = () => (
  <OldTable
    data={rows}
    columnDefs={(columns) =>
      (Object.keys(rows[0]) as (keyof typeof rows[0])[])
        .slice(0, 6)
        .map((col) =>
          columns.accessor(col, {
            header: snakeCaseToHumanReadable(col),
            footer: col,
          })
        )
    }
  />
);

export const ColumnGroup = () => (
  <OldTable
    data={rows}
    columnDefs={(columns) => [
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
    ]}
  />
);

export const NoHeader = () => (
  <OldTable
    data={rows}
    columnDefs={(columns) =>
      (Object.keys(rows[0]) as (keyof typeof rows[0])[])
        .slice(0, 6)
        .map((col) =>
          columns.accessor(col, {
            header: undefined,
          })
        )
    }
  />
);

export const PaginatedWithStaticData = () => (
  <OldTable
    data={rows}
    pageSize={6}
    columnDefs={(columns) =>
      (Object.keys(rows[0]) as (keyof typeof rows[0])[])
        .slice(0, 6)
        .map((col) =>
          columns.accessor(col, {
            header: snakeCaseToHumanReadable(col),
          })
        )
    }
  />
);

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

export const PaginatedWithDynamicData = (testProps: {
  onTableChange?: ComponentProps<typeof OldTable>['onTableChange'];
}) => {
  const [{ pageIndex, pageSize, sortBy, sortDesc }, setTableState] = useState<{
    pageIndex: number;
    pageSize: number;
    sortBy?: string;
    sortDesc?: boolean;
    selected?: Record<string, boolean>;
  }>({ pageIndex: 0, pageSize: 10 });
  const {
    result: { rows, rowCount },
    fetching,
  } = useMockDataQuery({
    pageIndex,
    pageSize,
    sortBy,
    sortDesc,
  });
  return (
    <OldTable
      data={rows}
      pageSize={pageSize}
      pageCount={Math.ceil(rowCount / pageSize)}
      showLoader={fetching}
      onTableChange={({ pageIndex, pageSize, sortBy, sortDesc, selected }) => {
        if (testProps.onTableChange)
          testProps.onTableChange({
            pageIndex,
            pageSize,
            sortBy,
            sortDesc,
            selected,
          });
        setTableState({
          pageIndex,
          pageSize,
          sortBy,
          sortDesc,
          selected,
        });
      }}
      columnDefs={(columns) =>
        (Object.keys(rows[0] || []) as (keyof typeof rows[0])[])
          .slice(0, 6)
          .map((col) =>
            columns.accessor(col, {
              header: snakeCaseToHumanReadable(col),
            })
          )
      }
    />
  );
};

export const Empty = () => <OldTable data={[] as typeof rows} />;

export const EmptyWithDefinedColumns = () => (
  <OldTable
    data={[] as typeof rows}
    columnDefs={(columns) =>
      (Object.keys(rows[0] || []) as (keyof typeof rows[0])[])
        .slice(0, 6)
        .map((col) =>
          columns.accessor(col, {
            header: snakeCaseToHumanReadable(col),
          })
        )
    }
  />
);
