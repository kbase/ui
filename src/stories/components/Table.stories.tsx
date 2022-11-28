import { ComponentMeta } from '@storybook/react';

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

export const Default = () => <Table data={rows} />;

export const CustomizedColumns = () => (
  <Table
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

export const Paginated = () => (
  <Table
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

export const Footer = () => (
  <Table
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
  <Table
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
  <Table
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
