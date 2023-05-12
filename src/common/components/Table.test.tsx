import { act, fireEvent, render, screen, within } from '@testing-library/react';
import classes from './Table.module.scss';
import { Table, useTableColumns } from './Table';
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

  test('renders loading Table', () => {
    const Wrapper = ({ isLoading }: { isLoading: boolean }) => {
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

      return <Table table={table} isLoading={isLoading} />;
    };

    const { rerender } = render(<Wrapper isLoading={false} />);
    let tableEle = screen.getByTestId('table');
    expect(tableEle).toHaveClass(classes['table-container']);
    expect(screen.queryByTestId('table-loader')).not.toBeInTheDocument();

    rerender(<Wrapper isLoading={true} />);
    tableEle = screen.getByTestId('table');
    expect(tableEle).toHaveClass(classes['table-container']);
    expect(screen.queryByTestId('table-loader')).toBeInTheDocument();
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
    act(() => {
      fireEvent.click(headers[0]);
    });
    expect(getRenderedTable()).toEqual([
      ['1', '6', '7', '8'],
      ['10', '3', '12', 'foo'],
      ['5', '2', '11', '4'],
    ]);
    // Click first header
    act(() => {
      fireEvent.click(headers[0]);
    });
    expect(getRenderedTable()).toEqual([
      ['5', '2', '11', '4'],
      ['10', '3', '12', 'foo'],
      ['1', '6', '7', '8'],
    ]);
    // Click fourth header
    act(() => {
      fireEvent.click(headers[3]);
    });
    expect(getRenderedTable()).toEqual([
      ['5', '2', '11', '4'],
      ['1', '6', '7', '8'],
      ['10', '3', '12', 'foo'],
    ]);
    // Click fourth header
    act(() => {
      fireEvent.click(headers[3]);
    });
    expect(getRenderedTable()).toEqual([
      ['10', '3', '12', 'foo'],
      ['1', '6', '7', '8'],
      ['5', '2', '11', '4'],
    ]);
  });

  test('Table pagination buttons act as expected', () => {
    const { getByTestId } = render(<Stories.PageSize />);
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
    act(() => {
      nextButton().click();
    });
    expect(currentPageButton()?.textContent).toBe('2');
    act(() => {
      nextButton().click();
    });
    expect(currentPageButton()?.textContent).toBe('3');

    // Prev
    act(() => {
      prevButton().click();
    });
    expect(currentPageButton()?.textContent).toBe('2');
    act(() => {
      prevButton().click();
    });
    expect(currentPageButton()?.textContent).toBe('1');
    // Prev should do nothing as we're on the first page
    expect(prevButton()).toBeDisabled();
    act(() => {
      prevButton().click();
    });
    expect(currentPageButton()?.textContent).toBe('1');

    // Click the last visible page button
    act(() => {
      resetPagination();
    });
    expect(currentPageButton()?.textContent).toBe('1');
    const last = pageButtons()[pageButtons().length - 1];
    act(() => {
      last.click();
    });
    expect(currentPageButton()?.innerText).toBe(last.innerText);
    // Next should do nothing as we're on the last page
    expect(nextButton()).toBeDisabled();
    act(() => {
      nextButton().click();
    });
    expect(currentPageButton()?.innerText).toBe(last.innerText);
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

test('row selection behaves as expected', () => {
  const selectionSpy = jest.fn();
  render(<Stories.RowSelection onSelectionChange={selectionSpy} />);
  const table = screen.getByTestId('table');
  const allBox = () =>
    within(table).getAllByTitle('Select all items on this page')[0];
  const rowBoxes = () =>
    Array.from(
      table.querySelectorAll('td input[type="checkbox"]')
    ) as HTMLInputElement[];
  expect(allBox()).toBeInTheDocument();
  expect(rowBoxes().length).toBe(10);
  act(() => {
    allBox().click();
  });
  expect(selectionSpy).toHaveBeenLastCalledWith([
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
  ]);
  act(() => {
    rowBoxes()[7].click();
  });
  expect(selectionSpy).toHaveBeenLastCalledWith([
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '8',
    '9',
  ]);
  act(() => {
    allBox().click();
    allBox().click();
  });
  expect(selectionSpy).toHaveBeenLastCalledWith([]);
  act(() => {
    rowBoxes()[1].click();
    rowBoxes()[3].click();
  });
  expect(selectionSpy).toHaveBeenLastCalledWith(['1', '3']);
});

test('useTableColumns hook makes appropriate headers from string lists', () => {
  const colSpy = jest.fn();
  const Wrapper = () => {
    const cols = useTableColumns({
      fieldNames: ['a', 'b', 'c', 'd', 'q', 'x'],
      exclude: ['b', 'z'],
      order: ['c', 'a', 'q'],
    });
    useEffect(() => colSpy(cols), [cols]);
    return <></>;
  };

  render(<Wrapper />);
  // Correct header order
  expect(colSpy.mock.calls[0][0]).toMatchObject([
    { header: 'c', id: 'c' },
    { header: 'a', id: 'a' },
    { header: 'q', id: 'q' },
    { header: 'd', id: 'd' },
    { header: 'x', id: 'x' },
  ]);
  // Correct header accessor
  const rowData = ['aValue', 'bValue', 'cValue', 'dValue', 'qValue', 'xValue'];
  expect(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    colSpy.mock.calls[0][0].map((col: any) => col.accessorFn?.(rowData))
  ).toEqual(['cValue', 'aValue', 'qValue', 'dValue', 'xValue']);
});

test('Empty useTableColumns hook returns empty column list', () => {
  const colSpy = jest.fn();
  const Wrapper = () => {
    const cols = useTableColumns({});
    useEffect(() => colSpy(cols), [cols]);
    return <></>;
  };

  render(<Wrapper />);
  // Correct header order
  expect(colSpy.mock.calls[0][0]).toEqual([]);
});
