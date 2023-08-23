import { flexRender, Table } from '@tanstack/react-table';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  HeatMapCell,
  HeatMapColumn,
  HeatMapRow,
} from '../../../common/api/collectionsApi';
import classes from './HeatMap.module.scss';
import { zoom } from 'd3-zoom';
import { select } from 'd3-selection';
import { Loader } from '../../../common/components/Loader';

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
  const heatMapImage = useMemo(() => {
    const inMemoryCanvas = document.createElement('canvas');
    inMemoryCanvas.setAttribute('width', String(width));
    inMemoryCanvas.setAttribute('height', String(height));
    // const ctx = canvasRef.current?.getContext('2d');
    const ctx = inMemoryCanvas.getContext('2d');
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
      return inMemoryCanvas;
    }
  }, [rows, width, height]);

  const [zoomState, setZoomState] = useState<{
    x: number;
    y: number;
    k: number;
  }>({ x: 0, y: 0, k: 1 });

  // Keep canvas up to date as zoom changes.
  const dynamicCanvasWidth = Math.floor(
    canvasRef.current?.getBoundingClientRect().width || width
  );
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (canvasRef.current && heatMapImage && ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.resetTransform();
      ctx.clearRect(
        0,
        0,
        canvasRef.current?.width || 0,
        canvasRef.current?.height || 0
      );
      ctx.translate(zoomState.x, zoomState.y);
      ctx.scale(dynamicCanvasWidth / width, dynamicCanvasWidth / width);
      ctx.scale(zoomState.k, zoomState.k);
      ctx.drawImage(heatMapImage, 0, 0);

      // Ensure zoom is set up on the canvas each draw
      select<Element, unknown>(canvasRef.current).call(
        zoom()
          .scaleExtent([1, 100])
          .translateExtent([
            [0, 0],
            [canvasRef.current.width, canvasRef.current.height],
          ])
          .extent([
            [0, 0],
            [canvasRef.current.width, canvasRef.current.height],
          ])
          .on('zoom', ({ transform, ...args }) => {
            setZoomState(transform);
          })
      );
    }
  }, [
    heatMapImage,
    width,
    zoomState.k,
    zoomState.x,
    zoomState.y,
    dynamicCanvasWidth,
  ]);

  // Calculate virtual scroll from zoom
  let visibleColHeaders = columnHeaders;
  let colOffset = 0;
  let visibleRows = rows;
  let rowOffset = 0;
  if (canvasRef.current) {
    // Calculate visible col headers for virtual scroll
    const visibleColCount = Math.floor(columnHeaders.length / zoomState.k);
    const pxPerCol = canvasRef.current.width / columnHeaders.length;
    const fractionalColPos0 = -zoomState.x / pxPerCol / zoomState.k;
    const colPos0 = Math.ceil(fractionalColPos0);
    visibleColHeaders = columnHeaders.slice(colPos0, colPos0 + visibleColCount);
    colOffset = (colPos0 - fractionalColPos0) * pxPerCol * zoomState.k;

    // Calculate visible row headers for virtual scroll
    const visibleRowCount = Math.floor(rows.length / zoomState.k);
    const pxPerRow = canvasRef.current.height / rows.length;
    const fractionalRowPos0 = -zoomState.y / pxPerRow / zoomState.k;
    const rowPos0 = Math.ceil(fractionalRowPos0);
    visibleRows = rows.slice(rowPos0, rowPos0 + visibleRowCount);
    rowOffset = (rowPos0 - fractionalRowPos0) * pxPerRow * zoomState.k;
  }

  if (!heatMapImage) {
    return (
      <>
        Loading and generating heatmap <Loader />
      </>
    );
  }

  return (
    <>
      <div className={classes['layout']}>
        <div className={classes['layout-left']}>
          <div className={classes['blank-origin']}></div>
          <div
            className={classes['row-names']}
            style={{ paddingTop: `${rowOffset}px` }}
          >
            {visibleRows.map((row, index) => (
              <div
                className={classes['label-wrapper']}
                key={row.id}
                title={rowNameAccessor(row.original, index)}
              >
                <div
                  className={[
                    classes['label-indicator'],
                    row.original.sel ? classes['label-indicator--primary'] : '',
                  ].join(' ')}
                  title={row.original.sel ? 'Selected' : ''}
                  style={{ display: hasSomeSelected ? undefined : 'none' }}
                />
                <div
                  className={[
                    classes['label-indicator'],
                    row.original.match
                      ? classes['label-indicator--accent-warm']
                      : '',
                  ].join(' ')}
                  title={row.original.match ? 'Matched' : ''}
                  style={{ display: hasSomeMatched ? undefined : 'none' }}
                />
                <div className={classes['label']}>
                  {rowNameAccessor(row.original, index)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={classes['layout-right']}>
          <div
            className={classes['trait-names']}
            style={{ paddingLeft: `${colOffset}px` }}
          >
            {visibleColHeaders.map((header) => {
              const colType = (
                header.column.columnDef.meta as HeatMapColumn | undefined
              )?.type;
              return (
                <div
                  className={classes['label-wrapper']}
                  key={header.id}
                  title={flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )?.toString()}
                >
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
                  <div className={classes['label']}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className={classes['heatmap-wrapper']}>
            <canvas
              title={title}
              className={classes['heatmap']}
              ref={canvasRef}
              width={dynamicCanvasWidth}
              height={(dynamicCanvasWidth / width) * height}
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
