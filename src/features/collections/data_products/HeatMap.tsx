import { flexRender, Table } from '@tanstack/react-table';
import { useEffect, useRef } from 'react';
import {
  HeatMapCell,
  HeatMapColumn,
  HeatMapRow,
} from '../../../common/api/collectionsApi';
import classes from './HeatMap.module.scss';

/**
 * Generic Collections HeatMap viz, accepts a table with cell values of 0-1
 */
export const HeatMap = ({
  table,
  rowNameAccessor,
  onCellHover,
  title,
}: {
  table: Table<HeatMapRow>;
  rowNameAccessor: (row: HeatMapRow, index: number) => string;
  onCellHover: (cell: HeatMapCell, row: string, x: number, y: number) => void;
  title: string;
}) => {
  const rows = table.getRowModel().rows;
  const columnHeaders = table
    .getFlatHeaders()
    .filter((header) => header.subHeaders.length === 0);

  const width = columnHeaders.length;
  const height = rows.length;

  const hasSomeSelected = rows.some((row) => row.original.sel);
  const hasSomeMatched = rows.some((row) => row.original.match);

  if (
    rows[0] &&
    columnHeaders &&
    rows[0].getVisibleCells().length !== columnHeaders.length
  )
    throw new Error(
      'heatmap has more headers than cell columns, something went wrong'
    );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && width > 0 && height > 0) {
      const imageData = ctx.createImageData(width, height);
      rows.forEach((row) =>
        row.getVisibleCells().forEach((cell, cellIndex) => {
          const x = cellIndex;
          const y = row.index;
          const pixelPos = (y * width + x) * 4;
          const col = normValToRGBA(Number(cell.getValue()));
          imageData.data[pixelPos] = col[0];
          imageData.data[pixelPos + 1] = col[1];
          imageData.data[pixelPos + 2] = col[2];
          imageData.data[pixelPos + 3] = col[3];
        })
      );
      ctx.putImageData(imageData, 0, 0);
    }
  }, [rows, width, height]);

  return (
    <>
      <div className={classes['heatmap-wrapper']}>
        <div className={classes['columns']}>
          {columnHeaders.map((header) => {
            const colType = (
              header.column.columnDef.meta as HeatMapColumn | undefined
            )?.type;
            return (
              <div className={classes['label-wrapper']} key={header.id}>
                <div
                  title={colType}
                  className={[
                    classes['label-indicator'],
                    classes[
                      colType === 'count'
                        ? 'label-indicator--info-dark'
                        : 'label-indicator--warning-dark'
                    ],
                  ].join(' ')}
                />
                <div
                  className={classes['label']}
                  title={flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )?.toString()}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className={classes['rows']}>
          {rows.map((row, index) => (
            <div className={classes['label-wrapper']} key={row.id}>
              <div
                className={classes['label']}
                title={rowNameAccessor(row.original, index)}
              >
                {rowNameAccessor(row.original, index)}
              </div>
              {hasSomeSelected ? (
                <div
                  className={[
                    classes['label-indicator'],
                    row.original.sel ? classes['label-indicator--primary'] : '',
                  ].join(' ')}
                  title={row.original.sel ? 'Selected' : ''}
                />
              ) : (
                <></>
              )}
              {hasSomeMatched ? (
                <div
                  className={[
                    classes['label-indicator'],
                    row.original.match
                      ? classes['label-indicator--accent-warm']
                      : '',
                  ].join(' ')}
                  title={row.original.match ? 'Matched' : ''}
                />
              ) : (
                <></>
              )}
            </div>
          ))}
        </div>
        <div className={classes['heatmap']}>
          <canvas
            title={title}
            ref={canvasRef}
            width={width}
            height={height}
            onMouseMove={(e) => {
              const canvas = e.currentTarget.getClientRects()[0];
              const x = Math.floor(
                ((e.clientX - canvas.x) / canvas.width) * width
              );
              const y = Math.floor(
                ((e.clientY - canvas.y) / canvas.height) * height
              );
              onCellHover(
                rows[y].original.cells[x],
                rows[y].original.kbase_id,
                e.clientX - canvas.x,
                e.clientY - canvas.y
              );
            }}
          />
        </div>
      </div>
    </>
  );
};
const _normCol = (val: number, c: number) => (255 - c) * (1 - val) + c;
const normValToRGBA = (val: number): Uint8Array =>
  new Uint8Array([
    _normCol(val, 182),
    _normCol(val, 21),
    _normCol(val, 28),
    255,
  ]);
