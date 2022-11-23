import { fireEvent, render, screen } from '@testing-library/react';
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

  test('renders Table with header group', () => {
    render(<Stories.ColumnGroup />);
    const table = screen.getByTestId('table');
    expect(table).toHaveClass(classes['table-container']);
    expect(table.querySelectorAll('thead tr').length).toBe(2);
  });

  test('renders Table with footer', () => {
    render(<Stories.Footer />);
    const table = screen.getByTestId('table');
    expect(table).toHaveClass(classes['table-container']);
    expect(table.querySelector('tfoot')).toBeInTheDocument();
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
    const { getByTestId } = render(<Stories.Paginated />);
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
});
