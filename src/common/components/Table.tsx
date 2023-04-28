import {
  CSSProperties,
  HTMLProps,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  PaginationState,
  HeaderGroup,
  DeepKeys,
  Table as TableType,
  Row,
  RowSelectionState,
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

export const Table = <Datum,>({
  table,
  className = '',
  rowStyle = () => ({}),
  isLoading = false,
  maxPage = Number.MAX_SAFE_INTEGER,
}: {
  table: TableType<Datum>;
  className?: string;
  rowStyle?: (row: Row<Datum>) => CSSProperties;
  isLoading?: boolean;
  maxPage?: number;
}) => {
  const shouldRenderHeader = someHeaderDefines(
    'header',
    table.getFooterGroups()
  );

  const shouldRenderFooter = someHeaderDefines(
    'footer',
    table.getFooterGroups()
  );

  const shouldRenderPagination = table.getPageCount() > 1;

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
              <tr key={row.id} style={rowStyle(row)}>
                {table.options.enableRowSelection ? (
                  <td>
                    <SelectBox
                      checked={row.getIsSelected()}
                      disabled={!row.getCanSelect()}
                      partial={row.getIsSomeSelected()}
                      onChange={row.getToggleSelectedHandler()}
                    />
                  </td>
                ) : undefined}
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {/* Add an empty <tr> for empty state to prevent header/footer stretching */}
            {table.getRowModel().rows.length < 1 ? <tr /> : undefined}
          </tbody>
          {shouldRenderFooter ? <TableFooter table={table} /> : undefined}
        </table>
        {isLoading ? (
          <div className={classes['loader']}>
            <FAIcon icon={faSpinner} spin size={'2x'} />
          </div>
        ) : null}
      </div>
      {shouldRenderPagination ? (
        <Pagination maxPage={maxPage} table={table} />
      ) : undefined}
    </div>
  );
};

const Pagination = <Datum,>({
  table,
  maxPage,
}: {
  table: TableType<Datum>;
  maxPage: number;
}) => {
  const totalButtons = 9; // Odd, >=9
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
            <SelectBox
              checked={table.getIsAllPageRowsSelected()}
              partial={table.getIsSomePageRowsSelected()}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
            />
          </th>
        ) : undefined}
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

const TableFooter = <Datum,>({ table }: { table: TableType<Datum> }) => (
  <tfoot>
    {table.getFooterGroups().map((footerGroup) => (
      <tr key={footerGroup.id}>
        {table.options.enableRowSelection ? (
          <th>
            <SelectBox
              checked={table.getIsAllPageRowsSelected()}
              partial={table.getIsSomePageRowsSelected()}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
            />
          </th>
        ) : undefined}
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
      if (!firstRowDatum) {
        return [];
      } else if (typeof firstRowDatum === 'object') {
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

function SelectBox({
  partial,
  className = '',
  ...rest
}: { partial?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof partial === 'boolean' && ref.current) {
      ref.current.indeterminate = !rest.checked && partial;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, partial]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + ' cursor-pointer'}
      {...rest}
    />
  );
}

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

export type ColumnDefs<Datum> = (
  columnHelper: ColumnHelper<Datum>
) => ColumnDef<Datum, any>[]; // eslint-disable-line @typescript-eslint/no-explicit-any

interface StaticTableProps {
  pageSize?: number;
  pageCount?: never;
  maxPage?: never;
  showLoader?: never;
  onTableChange?: never;
}

interface DynamicTableProps {
  pageSize: number;
  pageCount: number;
  maxPage?: number;
  showLoader?: boolean;
  onTableChange: (state: {
    sortBy?: string;
    sortDesc: boolean;
    pageIndex: number;
    pageSize: number;
    selected: Record<string, boolean>;
  }) => void;
}

type TableProps<Datum> = {
  data: Datum[];
  getRowId?: (row: Datum, index: number) => string;
  columnDefs?: ColumnDefs<Datum>;
  className?: string;
  rowStyle?: (row: Row<Datum>) => CSSProperties;
  selectable?: boolean;
  selected?: Record<string, boolean>;
} & (DynamicTableProps | StaticTableProps);

/**
 * Table component based on
 * [TanStack/table](https://tanstack.com/table/v8/docs/) see those docs for
 * detailed documentation on column definitions.
 */
export const OldTable = <Datum,>({
  data,
  getRowId,
  columnDefs,
  className,
  pageSize = Number.MAX_SAFE_INTEGER,
  pageCount,
  showLoader,
  onTableChange,
  maxPage = Number.MAX_SAFE_INTEGER,
  rowStyle = () => ({}),
  selectable,
  selected,
}: TableProps<Datum>) => {
  const isDynamic = onTableChange ? true : false;

  const defaultColumnDefs = useDefaultColumnDefs<Datum>(data[0]);
  const currentColumnDefs = columnDefs || defaultColumnDefs;
  const columns = useMemo(() => {
    return currentColumnDefs(createColumnHelper<Datum>());
  }, [currentColumnDefs]);

  const [sortState, setSortState] = useState<SortingState>([]);
  const [pageState, setPageState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [selectState, setSelectState] = useState<RowSelectionState>(
    selected || {}
  );

  const tableChangeRef = useRef(onTableChange);
  tableChangeRef.current = onTableChange;
  useEffect(() => {
    if (tableChangeRef.current)
      tableChangeRef.current({
        ...pageState,
        sortBy: sortState[0]?.id,
        sortDesc: sortState[0]?.desc ?? true,
        selected: selectState,
      });
  }, [pageState, sortState, selectState]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: sortState,
      pagination: pageState,
      rowSelection: selectState,
    },
    getCoreRowModel: getCoreRowModel(),
    getRowId: getRowId,

    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSortState,
    manualSorting: isDynamic,

    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPageState,
    manualPagination: isDynamic,
    pageCount: pageCount,
    enableRowSelection: selectable,
    onRowSelectionChange: setSelectState,
  });

  useEffect(() => {
    // Should show pagination buttons if pageSize is set on a table, but not if
    // the table is dynamic without a pageCount >=1
    let paginated = pageSize !== Number.MAX_SAFE_INTEGER;
    if (paginated && pageCount !== undefined) {
      paginated = pageCount >= 1;
    }
    // If pagination is disabled, set the tanstack page size to MAX_SAFE_INTEGER
    table.setPageSize(pageSize);
  }, [isDynamic, pageCount, pageSize, table]);

  useEffect(() => {
    setSelectState(selected || {});
  }, [selected]);

  return (
    <Table
      table={table}
      className={className}
      rowStyle={rowStyle}
      isLoading={showLoader}
      maxPage={maxPage}
    />
  );
};
