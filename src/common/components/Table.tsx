import { useEffect, useMemo, useState } from 'react';
import {
  createColumnHelper,
  ColumnHelper,
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  HeaderGroup,
  DeepKeys,
  Table as TableType,
} from '@tanstack/react-table';
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeftLong,
  faArrowRightLong,
  faCaretDown,
  faCaretUp,
  faSort,
} from '@fortawesome/free-solid-svg-icons';
import classes from './Table.module.scss';
import { Button } from './Button';

export type ColumnDefs<Datum> = (
  columnHelper: ColumnHelper<Datum>
) => ColumnDef<Datum, any>[]; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Table component based on
 * [TanStack/table](https://tanstack.com/table/v8/docs/) see those docs for
 * detailed documentation on column definitions.
 */
export const Table = <Datum extends unknown>({
  data,
  columnDefs,
  className,
  pageSize = false,
}: {
  data: Datum[];
  columnDefs?: ColumnDefs<Datum>;
  className?: string;
  pageSize?: number | false;
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const defaultColumnDefs = useDefaultColumnDefs<Datum>(data[0]);
  const currentColumnDefs = columnDefs || defaultColumnDefs;
  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Datum>();
    return currentColumnDefs(columnHelper);
  }, [currentColumnDefs]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const [shouldPaginate, setShouldPaginate] = useState(false);
  useEffect(() => {
    const paginated = !!pageSize && pageSize > 0;
    // If pagination is disabled, set the tanstack page size to MAX_SAFE_INTEGER
    const size = paginated ? pageSize : Number.MAX_SAFE_INTEGER;
    table.setPageSize(size);
    setShouldPaginate(paginated);
  }, [pageSize, table]);

  const shouldRenderHeader = someHeaderDefines(
    'header',
    table.getFooterGroups()
  );

  const shouldRenderFooter = someHeaderDefines(
    'footer',
    table.getFooterGroups()
  );

  return (
    <div
      className={[className, classes['table-container']].join(' ')}
      data-testid="table"
    >
      <div className={classes['table-wrapper']}>
        <table>
          {shouldRenderHeader ? <TableHeader table={table} /> : undefined}
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {shouldRenderFooter ? <TableFooter table={table} /> : undefined}
        </table>
      </div>
      {shouldPaginate ? <Pagination table={table} /> : undefined}
    </div>
  );
};

const Pagination = <Datum extends unknown>({
  table,
}: {
  table: TableType<Datum>;
}) => {
  const totalButtons = 9; // Odd, >=9
  const buttons: (number | ReturnType<typeof Button>)[] = [];
  const sideAmt = (totalButtons - 3) / 2; // how many bttns per side

  const start = 0;
  const curr = table.getState().pagination.pageIndex;
  const end = table.getPageCount() - 1;
  // Determine pagination range, clip at start/end
  let min = Math.max(start, curr - sideAmt);
  let max = Math.min(end, curr + sideAmt);
  // if needed, expand from start/end up to totalButtons
  if (curr - min < sideAmt) max = Math.min(end, max + sideAmt + min - curr);
  if (max - curr < sideAmt) min = Math.max(start, min - sideAmt + max - curr);
  // populate buttons
  for (let p = min; p <= max; p++) {
    buttons.push(p);
  }

  // add skip-to-start
  if (buttons[0] !== start) {
    buttons[0] = start;
    buttons[1] = (
      <Button key="etc-start" disabled>
        {'...'}
      </Button>
    );
  }
  buttons.unshift(
    <Button
      key="prev"
      disabled={!table.getCanPreviousPage()}
      onClick={() => table.previousPage()}
    >
      <FAIcon icon={faArrowLeftLong} />
    </Button>
  );

  // add skip-to-end
  if (buttons[buttons.length - 1] !== end) {
    buttons[buttons.length - 1] = end;
    buttons[buttons.length - 2] = (
      <Button key="etc-end" disabled>
        {'...'}
      </Button>
    );
  }
  buttons.push(
    <Button
      key="next"
      disabled={!table.getCanNextPage()}
      onClick={() => table.nextPage()}
    >
      <FAIcon icon={faArrowRightLong} />
    </Button>
  );

  return (
    <div className={classes['pagination']} data-testid="pagination">
      {buttons.map((button) =>
        typeof button === 'number' ? (
          <Button
            key={button}
            disabled={button === curr}
            onClick={() => table.setPageIndex(button)}
          >
            {button + 1}
          </Button>
        ) : (
          button
        )
      )}
    </div>
  );
};

const TableHeader = <Datum extends unknown>({
  table,
}: {
  table: TableType<Datum>;
}) => (
  <thead>
    {table.getHeaderGroups().map((headerGroup) => (
      <tr key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
          <th
            key={header.id}
            onClick={header.column.getToggleSortingHandler()}
            colSpan={header.colSpan}
          >
            {!header.isPlaceholder && header.column.getCanSort() ? (
              <span
                className={[
                  classes['sort-icon'],
                  ...(header.column.getIsSorted()
                    ? [classes['sort-icon--active']]
                    : []),
                ].join(' ')}
              >
                <FAIcon
                  icon={
                    { asc: faCaretUp, desc: faCaretDown }[
                      header.column.getIsSorted() as string
                    ] ?? faSort
                  }
                />
              </span>
            ) : null}
            {header.isPlaceholder
              ? null
              : flexRender(header.column.columnDef.header, header.getContext())}
          </th>
        ))}
      </tr>
    ))}
  </thead>
);

const TableFooter = <Datum extends unknown>({
  table,
}: {
  table: TableType<Datum>;
}) => (
  <tfoot>
    {table.getFooterGroups().map((footerGroup) => (
      <tr key={footerGroup.id}>
        {footerGroup.headers.map((footer) => (
          <th key={footer.id} colSpan={footer.colSpan}>
            {footer.isPlaceholder
              ? null
              : flexRender(footer.column.columnDef.footer, footer.getContext())}
          </th>
        ))}
      </tr>
    ))}
  </tfoot>
);

/**
 * Iterates over an array of `HeaderGroup`s to check if their associated column
 * definitions define a certain property. This is used to determine if the
 * footer/header should render
 */
const someHeaderDefines = <T,>(
  columnDefProp: keyof ColumnDef<unknown>,
  groups: HeaderGroup<T>[]
) => {
  return groups.some((group) =>
    group.headers.some((header) =>
      header.getLeafHeaders().some(
        (leafHeader) =>
          // Check if the leaf headers have the columnDefProp defined
          leafHeader.column.columnDef[columnDefProp] !== undefined
      )
    )
  );
};

/**
 * Determines a reasonable default for column definitions.
 */
const useDefaultColumnDefs = <Datum,>(
  firstRowDatum: Datum
): ColumnDefs<Datum> => {
  return useMemo(
    () => (columns) => {
      if (typeof firstRowDatum === 'object') {
        if (Array.isArray(firstRowDatum)) {
          // array datum
          return firstRowDatum.map((col, index) =>
            columns.accessor(
              (row) => (row as typeof firstRowDatum as unknown[])[index],
              {
                header: String(index),
              }
            )
          );
        } else {
          // object datum
          return (
            Object.keys(
              firstRowDatum as unknown as { [key: string]: unknown }
            ) as (keyof typeof firstRowDatum)[]
          ).map((col) =>
            columns.accessor(col as DeepKeys<Datum>, {
              header: String(col),
            })
          );
        }
      }
      throw new Error(
        `Cannot automatically create columns from data, use the columnDefs prop`
      );
    },
    [firstRowDatum]
  );
};
