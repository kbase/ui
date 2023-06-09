import { useMemo } from 'react';
import {
  createColumnHelper,
  ColumnDef,
  flexRender,
  HeaderGroup,
  Table as TableType,
  Row,
} from '@tanstack/react-table';
import { FontAwesomeIcon as FAIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeftLong,
  faArrowRightLong,
  faCaretDown,
  faCaretUp,
  faSort,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import classes from './Table.module.scss';
import { Button } from './Button';
import { CheckBox } from './CheckBox';

export const Table = <Datum,>({
  table,
  className = '',
  rowClass = () => '',
  isLoading = false,
}: {
  table: TableType<Datum>;
  className?: string;
  rowClass?: (row: Row<Datum>) => string;
  isLoading?: boolean;
}) => {
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
          {shouldRenderHeader ? <TableHeader table={table} /> : <></>}
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className={rowClass(row)}>
                {table.options.enableRowSelection ? (
                  <td>
                    <CheckBox
                      checked={row.getIsSelected()}
                      disabled={!row.getCanSelect()}
                      partial={row.getIsSomeSelected()}
                      onChange={row.getToggleSelectedHandler()}
                    />
                  </td>
                ) : (
                  <></>
                )}
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {/* Add an empty <tr> for empty state to prevent header/footer stretching */}
            {table.getRowModel().rows.length < 1 ? <tr /> : <></>}
          </tbody>
          {shouldRenderFooter ? <TableFooter table={table} /> : <></>}
        </table>
        {isLoading ? (
          <div className={classes['loader']} data-testid="table-loader">
            <FAIcon icon={faSpinner} spin size={'2x'} />
          </div>
        ) : (
          <></>
        )}
      </div>
      <div
        style={{
          display: 'block',
          float: 'left',
          clear: 'both',
          height: '1em',
        }}
      />
    </div>
  );
};

export const Pagination = <Datum,>({
  table,
  maxPage,
  /**Odd, >=9*/
  totalButtons = 9,
}: {
  table: TableType<Datum>;
  maxPage: number;
  totalButtons?: number;
}) => {
  if (totalButtons < 9 || totalButtons % 2 !== 1)
    throw new Error('Choose a valid total button number: Odd, >=9');
  const buttons: (number | ReturnType<typeof Button>)[] = [];
  const sideAmt = (totalButtons - 3) / 2; // how many buttons per side

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
      disabled={!table.getCanNextPage() || curr >= maxPage}
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
            disabled={button === curr || button > maxPage}
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

const TableHeader = <Datum,>({ table }: { table: TableType<Datum> }) => (
  <thead>
    {table.getHeaderGroups().map((headerGroup) => (
      <tr key={headerGroup.id}>
        {table.options.enableRowSelection ? (
          <th>
            <CheckBox
              title="Select all items on this page"
              checked={table.getIsAllPageRowsSelected()}
              partial={table.getIsSomePageRowsSelected()}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
            />
          </th>
        ) : (
          <></>
        )}
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
                    { asc: faCaretDown, desc: faCaretUp }[
                      header.column.getIsSorted() as string
                    ] ?? faSort
                  }
                />
              </span>
            ) : (
              <></>
            )}
            {header.isPlaceholder ? (
              <></>
            ) : (
              flexRender(header.column.columnDef.header, header.getContext())
            )}
          </th>
        ))}
      </tr>
    ))}
  </thead>
);

const TableFooter = <Datum,>({ table }: { table: TableType<Datum> }) => (
  <tfoot>
    {table.getFooterGroups().map((footerGroup) => (
      <tr key={footerGroup.id}>
        {table.options.enableRowSelection ? (
          <th>
            <CheckBox
              title="Select all items on this page"
              checked={table.getIsAllPageRowsSelected()}
              partial={table.getIsSomePageRowsSelected()}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
            />
          </th>
        ) : (
          <></>
        )}
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

export const useTableColumns = ({
  fieldNames = [],
  order = [],
  exclude = [],
}: {
  fieldNames?: string[];
  order?: string[];
  exclude?: string[];
}) => {
  const accessors: {
    [fieldName: string]: <RowData extends unknown[]>(
      rowData: RowData
    ) => RowData[number];
  } = {};
  fieldNames.forEach((fieldName, index) => {
    accessors[fieldName] = (rowData) => rowData[index];
  });

  const fieldsOrdered = fieldNames
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
    () => {
      const columns = createColumnHelper<unknown[]>();
      return fieldsOrdered.map((fieldName) =>
        columns.accessor(accessors[fieldName], {
          header: fieldName.replace(/_/g, ' ').trim(),
          id: fieldName,
        })
      );
    },
    // We only want to remake the columns if fieldNames or fieldsOrdered have new values
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(fieldNames), JSON.stringify(fieldsOrdered)]
  );
};
