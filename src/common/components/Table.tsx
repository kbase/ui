import { useEffect, useId, useMemo, useState } from 'react';
import {
  createColumnHelper,
  ColumnDef,
  flexRender,
  HeaderGroup,
  Table as TableType,
  Row,
  CellContext,
  VisibilityState,
} from '@tanstack/react-table';
import type { RowData } from '@tanstack/react-table';
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
import { Loader } from './Loader';
import { ColumnMeta, HeatMapRow } from '../api/collectionsApi';
import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Tooltip,
} from '@mui/material';
/*
See also: https://tanstack.com/table/v8/docs/api/core/column-def#meta
This supports passing arbitrary data into the table.
 */
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    [key: string]: string;
  }
}

type ColumnOptions = {
  textAlign?: 'left' | 'right' | 'center';
};

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
                  <td
                    key={cell.id}
                    style={{
                      textAlign: (
                        cell.column.columnDef.meta as Partial<ColumnOptions>
                      )?.textAlign,
                    }}
                  >
                    <Tooltip
                      title={`${cell.getValue()}`}
                      placement="top"
                      arrow
                      enterDelay={800}
                    >
                      <span>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </span>
                    </Tooltip>
                  </td>
                ))}
              </tr>
            ))}
            {/* Add an empty <tr> for empty state to prevent header/footer stretching */}
            {table.getRowModel().rows.length < 1 ? <tr /> : <></>}
          </tbody>
          {shouldRenderFooter ? <TableFooter table={table} /> : <></>}
          <Loader
            loading={isLoading}
            render={
              <div className={classes['loader']} data-testid="table-loader">
                <FAIcon icon={faSpinner} spin size={'2x'} />
              </div>
            }
          />
        </table>
      </div>
    </div>
  );
};

export const Pagination = <Datum,>({
  maxPage,
  table,
  className = '',
  /**Odd, >=9*/
  totalButtons = 9,
}: {
  maxPage: number;
  table: TableType<Datum>;
  className?: string;
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

  const extraClasses = className ? `${className} ` : '';
  const classNamePagination = `${extraClasses}${classes.pagination}`;
  // add skip-to-start
  if (buttons[0] !== start) {
    buttons[0] = start;
    buttons[1] = (
      <Button key="etc-start" color="gray" disabled>
        {'...'}
      </Button>
    );
  }
  buttons.unshift(
    <Button
      className={classNamePagination}
      color="gray"
      disabled={!table.getCanPreviousPage()}
      key="prev"
      onClick={() => table.previousPage()}
    >
      <FAIcon icon={faArrowLeftLong} />
    </Button>
  );

  // add skip-to-end
  if (buttons[buttons.length - 1] !== end) {
    buttons[buttons.length - 1] = end;
    buttons[buttons.length - 2] = (
      <Button
        key="etc-end"
        className={classNamePagination}
        color="gray"
        disabled
      >
        {'...'}
      </Button>
    );
  }
  buttons.push(
    <Button
      className={classNamePagination}
      color="gray"
      disabled={!table.getCanNextPage() || curr >= maxPage}
      key="next"
      onClick={() => table.nextPage()}
    >
      <FAIcon icon={faArrowRightLong} />
    </Button>
  );
  const buttonList = buttons.map((button, ix) =>
    typeof button === 'number' ? (
      <Button
        className={`${classNamePagination} ${
          button === curr ? classes.selected : ''
        }`}
        color="gray"
        disabled={button === curr || button > maxPage}
        hidden={button > maxPage} // Hides the max page when we can't display it
        key={button}
        onClick={() => table.setPageIndex(button)}
      >
        {button + 1}
      </Button>
    ) : (
      <div key={(button as React.ReactElement)?.key ?? ix}>{button}</div>
    )
  );
  return (
    <div className={classNamePagination} data-testid="pagination">
      {buttonList}
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
            style={{
              textAlign: (
                header.column.columnDef.meta as Partial<ColumnOptions>
              )?.textAlign,
            }}
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
  fields = [],
  order = [],
  exclude = [],
  defaultVisible = undefined,
}: {
  fields?: {
    displayName?: string;
    id: string;
    options?: ColumnOptions;
    render?: (cellData: CellContext<unknown[], unknown>) => unknown;
  }[];
  order?: string[];
  exclude?: string[];
  defaultVisible?: string[] | undefined;
}) => {
  const accessors: {
    [fieldName: string]: <RowData extends unknown[]>(
      rowData: RowData
    ) => RowData[number];
  } = {};
  fields.forEach(({ id, render }, index) => {
    accessors[id] = (rowData) => rowData[index];
  });

  const fieldsOrdered = fields
    .filter(({ id }) => !exclude.includes(id.toLowerCase()))
    .sort((a, b) => {
      const aOrder = order.indexOf(a.id.toLowerCase());
      const bOrder = order.indexOf(b.id.toLowerCase());
      if (aOrder !== -1 && bOrder !== -1) {
        return aOrder - bOrder;
      } else if (aOrder !== -1) {
        return -1;
      } else if (bOrder !== -1) {
        return 1;
      } else {
        return fields.indexOf(a) - fields.indexOf(b);
      }
    });

  const createDefaultVisible = (): VisibilityState => {
    if (!defaultVisible) return {};
    return fieldsOrdered.reduce<VisibilityState>((columnVisibility, field) => {
      columnVisibility[field.id] = defaultVisible.includes(
        field.id.toLowerCase()
      );
      return columnVisibility;
    }, {});
  };

  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(createDefaultVisible);

  // in case fields change, this happens during initialization so is required.
  const fieldsKey = JSON.stringify(fieldsOrdered.map(({ id }) => id));
  useEffect(() => {
    setColumnVisibility(createDefaultVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldsKey]);

  return {
    columnVisibility,
    setColumnVisibility,
    ...useMemo(
      () => {
        const columns = createColumnHelper<unknown[]>();
        setColumnVisibility((columnVisibility) => ({
          ...Object.fromEntries(fieldsOrdered.map((col) => [col.id, true])),
          ...columnVisibility,
        }));
        return {
          columns: fieldsOrdered,
          columnDefs: fieldsOrdered.map((field) =>
            columns.accessor(accessors[field.id], {
              header: field.displayName ?? field.id.replace(/_/g, ' ').trim(),
              id: field.id,
              meta: field.options,
              cell:
                field.render ||
                ((cell: CellContext<unknown[], unknown>) => {
                  const val = cell.getValue();
                  if (typeof val === 'string') return cell.getValue();
                  if (typeof val === 'number')
                    return (cell.getValue() as number).toLocaleString();
                  return cell.getValue();
                }),
            })
          ),
        };
      },
      // We only want to remake the columns if fieldNames or fieldsOrdered have new values
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [JSON.stringify(fields), JSON.stringify(fieldsOrdered)]
    ),
  };
};

/**
 * Get the lower bound and upper bound of a table page (i.e. the first and last row index starting from 1).
 * For example, if you are on page 2 of a dataset with 17 rows and the table shows 10 rows per page,
 * then the first row is 11 and the last row is 17.
 * Note: it's unclear how to make the type of `table` more permissive. For now I'm including an extra type specifically for the HeatMap table.
 */
export const usePageBounds = (
  table: TableType<unknown[]> | TableType<HeatMapRow>
) => {
  const firstRow =
    table.getState().pagination.pageIndex *
      table.getState().pagination.pageSize +
    1;
  const lastRow = firstRow - 1 + table.getPaginationRowModel().rows.length;
  return {
    firstRow,
    lastRow,
  };
};

export const ColumnSelect = ({
  columnVisibility,
  setColumnVisibility,
  columnMeta,
}: {
  columnVisibility: VisibilityState;
  setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
  columnMeta: { [k: string]: ColumnMeta } | undefined;
}) => {
  const id = useId();
  const visible = Object.entries(columnVisibility)
    .filter(([id, visible]) => visible)
    .map(([id]) => id);
  return (
    <>
      <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel id={id}>Columns</InputLabel>
        <Select
          labelId={id}
          id="demo-multiple-checkbox"
          multiple
          value={visible}
          onChange={(visibleCols) => {
            const isViz =
              typeof visibleCols.target.value === 'string'
                ? [visibleCols.target.value]
                : visibleCols.target.value;
            setColumnVisibility(
              Object.fromEntries(
                Object.entries(columnVisibility).map(([id, val]) => {
                  return [id, isViz.includes(id)];
                })
              )
            );
          }}
          input={<OutlinedInput label="Columns" />}
          renderValue={(selected) => {
            return selected
              .map((id) => columnMeta?.[id]?.display_name || id)
              .join(', ');
          }}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 48 * 4.5 + 8,
                width: 250,
              },
            },
          }}
        >
          {Object.entries(columnVisibility).map(([id, value]) => (
            <MenuItem key={id} value={id}>
              <Checkbox checked={value} />
              <ListItemText primary={columnMeta?.[id]?.display_name || id} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};
