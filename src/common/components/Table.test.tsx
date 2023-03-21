import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import classes from './Table.module.scss';
import { Table } from './Table';
import * as Stories from '../../stories/components/Table.stories';

describe('Table', () => {
  test('renders Table', () => {
    render(
      <Table
        data={[
          { a: 1, b: 2, c: 3 },
          { a: 4, b: 5, c: 6 },
        ]}
      />
    );
    const table = screen.getByTestId('table');
    expect(table).toHaveClass(classes['table-container']);
    expect(table.querySelectorAll('th').length).toBe(3);
    expect(table.querySelectorAll('td').length).toBe(6);
  });

  test('renders Table from 2d array', () => {
    render(
      <Table
        data={[
          [1, 2, 3, 4],
          [5, 6, 7, 8],
        ]}
      />
    );
    const table = screen.getByTestId('table');
    expect(table).toHaveClass(classes['table-container']);
    expect(table.querySelectorAll('th').length).toBe(4);
    expect(table.querySelectorAll('td').length).toBe(8);
  });

  test('throws error for non-array non-object data array', () => {
    const consoleError = jest.spyOn(console, 'error');
    consoleError.mockImplementation(() => undefined);
    expect(() =>
      render(<Table data={['some', 1, 'weird', 0, 'array']} />)
    ).toThrowError(
      'Cannot automatically create columns from data, use the columnDefs prop'
    );
    expect(consoleError).toBeCalled(); // As this results in an uncaught error
    consoleError.mockRestore();
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
    render(
      <Table
        data={[
          [1, 2, 3, 4],
          [5, 6, 7, 8],
          [10, 11, 12],
        ]}
        pageSize={2}
      />
    );
    const table = screen.getByTestId('table');
    expect(table).toHaveClass(classes['table-container']);
    const pagination = screen.getByTestId('pagination');
    expect(pagination).toBeInTheDocument();
  });

  test('Table sorts when sortable headers are clicked', async () => {
    render(
      <Table
        data={[
          ['5', '2', '11', '4'],
          ['1', '6', '7', '8'],
          ['10', '3', '12', 'foo'],
        ]}
      />
    );
    const table = screen.getByTestId('table');
    expect(table).toHaveClass(classes['table-container']);
    const headers = Array.from(table.querySelectorAll('th'));
    const getRenderedTable = () => {
      const rendered: string[][] = [];
      table.querySelectorAll('tbody tr').forEach((tr) => {
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

  test('renders empty static Table', () => {
    render(<Table data={[]} />);
    const table = screen.getByTestId('table');
    expect(table).toHaveClass(classes['table-container']);
  });

  test('renders empty dynamic Table', () => {
    render(
      <Table data={[]} pageCount={0} pageSize={10} onTableChange={jest.fn()} />
    );
    const table = screen.getByTestId('table');
    expect(table).toHaveClass(classes['table-container']);
  });
});
