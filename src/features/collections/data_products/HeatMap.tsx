import { flexRender, Table } from '@tanstack/react-table';
import { useEffect, useRef } from 'react';
import {
  HeatMapCell,
  HeatMapColumn,
  HeatMapRow,
} from '../../../common/api/collectionsApi';
import classes from './Microtrait.module.scss';

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
  onCellHover: (cell: HeatMapCell, x: number, y: number) => void;
  title: string;
}) => {
  const rows = table.getRowModel().rows;
  const columnHeaders = table
    .getFlatHeaders()
    .filter((header) => header.subHeaders.length === 0);

  const width = columnHeaders.length;
  const height = rows.length;

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
                  className={classes['label']}
                  title={flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )?.toString()}
                >
                  <div
                    title={colType}
                    className={[
                      classes['indicator'],
                      classes[
                        colType === 'count'
                          ? 'indicator--info-dark'
                          : 'indicator--warning-dark'
                      ],
                    ].join(' ')}
                  />
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
                <div
                  className={[
                    classes['indicator'],
                    row.original.match ? classes['indicator--accent-warm'] : '',
                  ].join(' ')}
                  title={row.original.match ? 'Matched' : ''}
                />
                <div
                  className={[
                    classes['indicator'],
                    row.original.sel ? classes['indicator--primary'] : '',
                  ].join(' ')}
                  title={row.original.sel ? 'Selected' : ''}
                />
              </div>
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
const _normCol = (val: number, c: number) => (255 - c) * val + c;
const normValToRGBA = (val: number): Uint8Array =>
  new Uint8Array([
    _normCol(val, 2),
    _normCol(val, 109),
    _normCol(val, 170),
    255,
  ]);
