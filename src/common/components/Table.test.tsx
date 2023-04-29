import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import classes from './Table.module.scss';
import { Table } from './Table';
import * as Stories from '../../stories/components/Table.stories';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useMemo } from 'react';

describe('Table', () => {
  test('renders Table', () => {
    const Wrapper = () => {
      const data = useMemo(
        () => [
          { a: 1, b: 2, c: 3 },
          { a: 4, b: 5, c: 6 },
        ],
        []
      );
      const helper = createColumnHelper<typeof data[number]>();
      const table = useReactTable({
        data,
        columns: Object.keys(data[0]).map((k) =>
          helper.accessor(k as keyof typeof data[number], {
            header: k,
          })
        ),
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: false,
      });

      return <Table table={table} />;
    };

    render(<Wrapper />);
    const tableEle = screen.getByTestId('table');
    expect(tableEle).toHaveClass(classes['table-container']);
    expect(tableEle.querySelectorAll('th').length).toBe(3);
    expect(tableEle.querySelectorAll('td').length).toBe(6);
  });

  test('renders header-less Table', () => {
    render(<Stories.NoHeader />);
    const table = screen.getByTestId('table');
    expect(table).toHaveClass(classes['table-container']);
    expect(table.querySelector('thead')).not.toBeInTheDocument();
  });

  test('renders Table with footer', () => {
    render(<Stories.Footer />);
    const table = screen.getByTestId('table');
    expect(table).toHaveClass(classes['table-container']);
    expect(table.querySelector('tfoot')).toBeInTheDocument();
  });

  test('renders Table with header group', () => {
    render(<Stories.ColumnGroup />);
    const table = screen.getByTestId('table');
    expect(table).toHaveClass(classes['table-container']);
    expect(table.querySelectorAll('thead tr').length).toBe(2);
    expect(table.querySelectorAll('tfoot tr').length).toBe(2);
    const headers = table.querySelectorAll('thead th');
    expect(headers).toContain(screen.getByText('Scaffolds'));
    expect(headers).toContain(screen.getByText('scaffold count'));
    expect(headers).toContain(screen.getByText('longest scaffold'));
    const footers = table.querySelectorAll('tfoot th');
    expect(footers).toContain(screen.getByText('column group footer'));
    expect(footers).toContain(screen.getByText('some footer here'));
    expect(footers).toContain(screen.getByText('some other footer here'));
  });

  test('renders paginated Table', () => {
    const Wrapper = () => {
      const data = useMemo(
        () => [
          [1, 2, 3, 4],
          [5, 6, 7, 8],
          [10, 11, 12],
        ],
        []
      );

      const helper = createColumnHelper<typeof data[number]>();
      const table = useReactTable({
        data,
        columns: data[0].map((v, i) =>
          helper.accessor((row) => row[i], {
            header: String(i),
          })
        ),
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
      });

      useEffect(() => table.setPageSize(2), [table]);

      return <Table table={table} />;
    };

    render(<Wrapper />);
    const tableEle = screen.getByTestId('table');
    expect(tableEle).toHaveClass(classes['table-container']);
    const pagination = screen.getByTestId('pagination');
    expect(pagination).toBeInTheDocument();
  });

  test('Table sorts when sortable headers are clicked', async () => {
    const Wrapper = () => {
      const data = useMemo(
        () => [
          ['5', '2', '11', '4'],
          ['1', '6', '7', '8'],
          ['10', '3', '12', 'foo'],
        ],
        []
      );

      const helper = createColumnHelper<typeof data[number]>();
      const table = useReactTable({
        data,
        columns: data[0].map((v, i) =>
          helper.accessor((row) => row[i], {
            header: String(i),
          })
        ),
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        enableRowSelection: false,
      });

      return <Table table={table} />;
    };

    render(<Wrapper />);
    const tableEle = screen.getByTestId('table');
    expect(tableEle).toHaveClass(classes['table-container']);
    const headers = Array.from(tableEle.querySelectorAll('th'));
    const getRenderedTable = () => {
      const rendered: string[][] = [];
      tableEle.querySelectorAll('tbody tr').forEach((tr) => {
        const row: string[] = [];
        tr.querySelectorAll('td').forEach((td) => {
          row.push(td.textContent || '');
        });
        rendered.push(row);
      });
      return rendered;
    };

    expect(getRenderedTable()).toEqual([
      ['5', '2', '11', '4'],
      ['1', '6', '7', '8'],
      ['10', '3', '12', 'foo'],
    ]);
    // Click first header
    // these sort as strings not numbers
    fireEvent.click(headers[0]);
    expect(getRenderedTable()).toEqual([
      ['1', '6', '7', '8'],
      ['10', '3', '12', 'foo'],
      ['5', '2', '11', '4'],
    ]);
    // Click first header
    fireEvent.click(headers[0]);
    expect(getRenderedTable()).toEqual([
      ['5', '2', '11', '4'],
      ['10', '3', '12', 'foo'],
      ['1', '6', '7', '8'],
    ]);
    // Click fourth header
    fireEvent.click(headers[3]);
    expect(getRenderedTable()).toEqual([
      ['5', '2', '11', '4'],
      ['1', '6', '7', '8'],
      ['10', '3', '12', 'foo'],
    ]);
    // Click fourth header
    fireEvent.click(headers[3]);
    expect(getRenderedTable()).toEqual([
      ['10', '3', '12', 'foo'],
      ['1', '6', '7', '8'],
      ['5', '2', '11', '4'],
    ]);
  });

  test('Table pagination buttons act as expected', () => {
    const { getByTestId } = render(<Stories.PaginatedWithStaticData />);
    const table = getByTestId('table');
    const pagination = getByTestId('pagination');
    // Test helpers
    const buttons = () => Array.from(pagination.querySelectorAll('button'));
    const prevButton = () => buttons()[0];
    const nextButton = () => buttons()[buttons().length - 1];
    const pageButtons = () =>
      buttons().filter((button) => /\d/.test(button.textContent || ''));
    const currentPageButton = () =>
      pageButtons().find((button) => button.disabled);
    const resetPagination = () =>
      pageButtons()
        .find((button) => button.textContent === '1')
        ?.click();

    expect(table).toBeInTheDocument();
    expect(table).toHaveClass(classes['table-container']);
    expect(pagination).toBeInTheDocument();
    expect(currentPageButton()?.textContent).toBe('1');

    // Next
    nextButton().click();
    expect(currentPageButton()?.textContent).toBe('2');
    nextButton().click();
    expect(currentPageButton()?.textContent).toBe('3');

    // Prev
    prevButton().click();
    expect(currentPageButton()?.textContent).toBe('2');
    prevButton().click();
    expect(currentPageButton()?.textContent).toBe('1');
    // Prev should do nothing as we're on the first page
    expect(prevButton()).toBeDisabled();
    prevButton().click();
    expect(currentPageButton()?.textContent).toBe('1');

    // Click the last visible page button
    resetPagination();
    expect(currentPageButton()?.textContent).toBe('1');
    const last = pageButtons()[pageButtons().length - 1];
    last.click();
    expect(currentPageButton()?.innerText).toBe(last.innerText);
    // Next should do nothing as we're on the last page
    expect(nextButton()).toBeDisabled();
    nextButton().click();
    expect(currentPageButton()?.innerText).toBe(last.innerText);
  });

  test('Table pagination and sort buttons trigger calls to onTableChange for dynamic tables', async () => {
    const onTableChange = jest.fn();
    const { getByTestId } = render(
      <Stories.PaginatedWithDynamicData onTableChange={onTableChange} />
    );
    const table = getByTestId('table');
    const pagination = () => getByTestId('pagination');
    // Test helpers
    const buttons = () => Array.from(pagination().querySelectorAll('button'));
    const prevButton = () => buttons()[0];
    const nextButton = () => buttons()[buttons().length - 1];

    expect(table).toBeInTheDocument();
    expect(table).toHaveClass(classes['table-container']);
    await waitFor(() => expect(pagination()).toBeInTheDocument());
    expect(onTableChange).toHaveBeenLastCalledWith({
      pageIndex: 0,
      pageSize: 10,
      sortBy: undefined,
      sortDesc: true,
    });

    // Test that pagination triggers onTableChange
    nextButton().click();
    await waitFor(() => expect(onTableChange).toHaveBeenCalled());
    expect(onTableChange).toHaveBeenLastCalledWith({
      pageIndex: 1,
      pageSize: 10,
      sortBy: undefined,
      sortDesc: true,
    });

    prevButton().click();
    await waitFor(() => expect(onTableChange).toHaveBeenCalled());
    expect(onTableChange).toHaveBeenLastCalledWith({
      pageIndex: 0,
      pageSize: 10,
      sortBy: undefined,
      sortDesc: true,
    });

    // Test that sorting triggers onTableChange
    const headers = Array.from(table.querySelectorAll('th'));
    fireEvent.click(headers[0]);
    await waitFor(() => expect(onTableChange).toHaveBeenCalled());
    expect(onTableChange).toHaveBeenLastCalledWith({
      pageIndex: 0,
      pageSize: 10,
      sortBy: 'genome_name',
      sortDesc: false,
    });

    fireEvent.click(headers[0]);
    await waitFor(() => expect(onTableChange).toHaveBeenCalled());
    expect(onTableChange).toHaveBeenLastCalledWith({
      pageIndex: 0,
      pageSize: 10,
      sortBy: 'genome_name',
      sortDesc: true,
    });

    fireEvent.click(headers[5]);
    await waitFor(() => expect(onTableChange).toHaveBeenCalled());
    expect(onTableChange).toHaveBeenLastCalledWith({
      pageIndex: 0,
      pageSize: 10,
      sortBy: 'ncbi_species_taxid',
      sortDesc: true,
    });
  });

  test('renders empty Table', () => {
    const Wrapper = () => {
      const data: unknown[][] = useMemo(() => [], []);

      const helper = createColumnHelper<typeof data[number]>();
      const table = useReactTable({
        data,
        columns: (data[0] ?? []).map((v, i) =>
          helper.accessor((row) => row[i], {
            header: String(i),
          })
        ),
        getCoreRowModel: getCoreRowModel(),
      });

      return <Table table={table} />;
    };

    render(<Wrapper />);
    const tableEle = screen.getByTestId('table');
    expect(tableEle).toHaveClass(classes['table-container']);
  });
});
