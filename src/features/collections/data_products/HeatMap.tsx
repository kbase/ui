import { Column, Table } from '@tanstack/react-table';
import { FC, ReactNode, useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js';
import Plot from 'react-plotly.js';
import { HeatMapCell, HeatMapRow } from '../../../common/api/collectionsApi';
import { Button, Loader } from '../../../common/components';
import { noOp } from '../../common';
import classes from './HeatMap.module.scss';

/* enums, interfaces, types */
enum TooltipRole {
  cursor = 'cursor',
  inspector = 'inspector',
}

export interface HeatMapCallback {
  getCellLabel: (
    cell: HeatMapCell,
    row: HeatMapRow,
    column: Column<HeatMapRow, unknown>
  ) => ReactNode | Promise<ReactNode>;
}

interface HeatMapData {
  labels: (React.ReactElement | string | null)[][];
  values: (number | null)[][];
  headersColumn: string[];
  headersRow: string[];
}

interface HeatMapMetaData {
  ncols: number;
  nrows: number;
}

interface PlotlyWindow {
  xMax: number;
  yMax: number;
  xMin: number;
  yMin: number;
}

interface PlotlyState {
  plotlyWindow: PlotlyWindow;
  setPlotlyWindow: React.Dispatch<React.SetStateAction<PlotlyWindow>>;
}

interface TooltipData {
  clientX: number;
  clientY: number;
  meta: React.ReactElement | string | null;
}

type TooltipDataSetter = React.Dispatch<React.SetStateAction<TooltipData>>;

/* tooltip interfaces */
interface TooltipProps extends TooltipData {
  disabled: boolean;
  loading?: boolean;
  onClick?: () => void;
}

interface TooltipCursorProps extends TooltipData {
  updated: boolean;
  tooltipCursorDataSetterRef: React.MutableRefObject<TooltipDataSetter | null>;
}

interface TooltipInspectorProps extends TooltipData {
  setTooltipRole: React.Dispatch<React.SetStateAction<TooltipRole>>;
}

/**
 * PlotlyWrapperProps
 */
interface PlotlyWrapperProps {
  data: HeatMapData;
  getCellLabel: HeatMapCallback['getCellLabel'];
  heatMapMetaData: HeatMapMetaData;
  hover: boolean;
  plotlyState: PlotlyState;
  relayoutHandler: (evt: Readonly<Plotly.PlotRelayoutEvent>) => void;
  setHover: React.Dispatch<React.SetStateAction<boolean>>;
  setTooltipInspectorProps: TooltipDataSetter;
  setTooltipRole: React.Dispatch<React.SetStateAction<TooltipRole>>;
  tooltipCursorDataSetterRef?: React.MutableRefObject<TooltipDataSetter | null>;
  tooltipProps: TooltipData;
  tooltipRole: TooltipRole;
}

/* constants */
export const MAX_HEATMAP_PAGE = 10000;

const heatMapInfoDefaults: TooltipData = {
  clientX: 0,
  clientY: 0,
  meta: '',
};

/* utilities */
const abbrHeader = (header: string) =>
  header.length < 19 ? header : `${header.slice(0, 8)}...${header.slice(-8)}`;

const getNumber = ({
  value,
  valueIfNotFinite,
}: {
  value: number;
  valueIfNotFinite: number;
}) => (Number.isFinite(Number(value)) ? Number(value) : valueIfNotFinite);

/* convert the tanstack table data into the format Plotly expects */
const getPlotlyFromTanstack = ({
  getCellLabel,
  pageSize,
  table,
}: {
  getCellLabel: HeatMapCallback['getCellLabel'];
  pageSize: number;
  table: Table<HeatMapRow>;
}) => {
  const rows_raw = table.getSortedRowModel().rows;
  const nrows_raw = rows_raw.length;
  const pageSizeMin = 10;
  const nrows = Math.min(pageSize, Math.max(pageSizeMin, nrows_raw));
  const cols = table.getAllFlatColumns().filter((col) => col.parent);
  const ncols = cols.length;
  const headersColumn: string[] = cols.map((col, cix) => {
    const headerRaw = col.columnDef.header as string;
    return abbrHeader(headerRaw);
  });
  const condition = (ix: number, n: number) => n === 0 || n < nrows - ix;
  const offset = (ix: number) => nrows - ix - 1;
  const headersRow: HeatMapData['headersRow'] = [];
  const values: HeatMapData['values'] = [];
  const labels: HeatMapData['labels'] = [];
  Array(nrows)
    .fill(0)
    .forEach((zero, rix) => {
      if (condition(rix, nrows_raw)) {
        headersRow.push('');
        labels.push(Array(ncols).fill(<></>));
        values.push(Array(ncols).fill(0));
        return;
      }
      /* Compute Header */
      const row = rows_raw[offset(rix)];
      const headerRaw = row.id;
      const header = abbrHeader(headerRaw);
      /* Compute Value */
      const cells = row.getAllCells();
      const value = cells.map((cell) => cell.getValue() as number);
      /* Compute Cell Labels */
      const hmcs: HeatMapCell[] = cells.map((cell, cix) => {
        const col_id = cell.column.id;
        const { cell_id, val } = cell.row.original.cells.filter(
          (cell_) => cell_.col_id === col_id
        )[0];
        return {
          cell_id,
          col_id,
          val,
        };
      });
      const cellLabels: (React.ReactElement | string | null)[] = [];
      cells.forEach((cell, cix) => {
        const col_id = cell.column.id;
        const { cell_id, val } = cell.row.original.cells.filter(
          (cell_) => cell_.col_id === col_id
        )[0];
        const hmc: HeatMapCell = {
          cell_id,
          col_id,
          val,
        };
        const hmr: HeatMapRow = {
          match: false,
          sel: false,
          kbase_id: row.original.kbase_id,
          kbase_display_name: row.id,
          cells: hmcs,
        };
        const getCellLabelCallback = async () =>
          await getCellLabel(hmc, hmr, cell.column);
        const label = <CellLabel getCellLabelCallback={getCellLabelCallback} />;
        cellLabels.push(label);
      });
      headersRow.push(header);
      labels.push(cellLabels);
      values.push(value);
    });
  const output = {
    headersColumn,
    headersRow,
    labels,
    ncols,
    nrows,
    values,
  };
  return output;
};

/* handlers */
const relayoutHandlerFactory =
  ({
    heatMapMetaData,
    setHover,
    setPlotlyWindow,
    setTooltipRole,
  }: {
    heatMapMetaData: HeatMapMetaData;
    setHover: React.Dispatch<React.SetStateAction<boolean>>;
    setPlotlyWindow: PlotlyState['setPlotlyWindow'];
    setTooltipRole: React.Dispatch<React.SetStateAction<TooltipRole>>;
  }) =>
  (evt: Readonly<Plotly.PlotRelayoutEvent>) => {
    const { ncols, nrows } = heatMapMetaData;
    /* Fixes plotly range bug.
      When panning and zooming, it is possible to drag the plot outside the
      window, sometimes when this happens the endpoints are not defined
      properly. The following checks resolve this issue.
    */
    const xMaxFinite = getNumber({
      value: Number(evt['xaxis.range[1]']),
      valueIfNotFinite: ncols,
    });
    const yMaxFinite = getNumber({
      value: Number(evt['yaxis.range[1]']),
      valueIfNotFinite: nrows,
    });
    const xMinFinite = getNumber({
      value: Number(evt['xaxis.range[0]']),
      valueIfNotFinite: 0,
    });
    const yMinFinite = getNumber({
      value: Number(evt['yaxis.range[0]']),
      valueIfNotFinite: 0,
    });
    const xMaxBug = Math.min(xMaxFinite, ncols);
    const yMaxBug = Math.min(yMaxFinite, nrows);
    const xMinBug = Math.max(xMinFinite, 0);
    const yMinBug = Math.max(yMinFinite, 0);
    const [xMax, xMin] =
      xMinBug < xMaxBug ? [xMaxBug, xMinBug] : [xMinBug, xMaxBug];
    const [yMax, yMin] =
      yMinBug < yMaxBug ? [yMaxBug, yMinBug] : [yMinBug, yMaxBug];
    const newPlotlyWindow = {
      xMax,
      yMax,
      xMin,
      yMin,
    };
    setHover(false);
    setPlotlyWindow(newPlotlyWindow);
  };

/* components */
/* <Tooltip /> component */
export const Tooltip: FC<TooltipProps> = ({
  clientX,
  clientY,
  disabled,
  meta,
  loading = false,
  onClick = noOp,
}) => {
  /* derived values */
  const style: React.CSSProperties = {
    left: clientX,
    pointerEvents: disabled ? 'none' : 'auto',
    top: clientY,
  };
  const showSpinner = loading || !meta;
  /* Tooltip component */
  return (
    <>
      <div className={classes.tooltip} style={style}>
        {showSpinner ? <Loader type="spinner" loading={true} /> : <></>}
        {meta}
        <br />
        <Button disabled={disabled} onClick={onClick}>
          Close
        </Button>
      </div>
    </>
  );
};

/* <TooltipCursor /> component */
export const TooltipCursor: FC<TooltipCursorProps> = ({
  clientX,
  clientY,
  meta,
  tooltipCursorDataSetterRef,
  updated,
}) => {
  /* hooks */
  const [updatedState, setUpdatedState] = useState(updated);
  const [data, setData] = useState({
    clientX,
    clientY,
    meta,
  });
  /* the refs are set here */
  const setter = (value: React.SetStateAction<TooltipData>) => {
    setUpdatedState(true);
    setData(value);
  };
  if (
    tooltipCursorDataSetterRef &&
    Object.hasOwn(tooltipCursorDataSetterRef, 'current')
  ) {
    tooltipCursorDataSetterRef.current = setter;
  }
  /* If no data has been added then show nothing. */
  if (!updatedState) {
    return <></>;
  }
  /* TooltipCursor component */
  return <Tooltip disabled={true} {...data} />;
};

/* <TooltipInspector /> component */
export const TooltipInspector: FC<TooltipInspectorProps> = ({
  setTooltipRole,
  ...tooltipProps
}) => {
  const closeHandler = () => {
    setTooltipRole(TooltipRole.cursor);
  };
  /* TooltipInspector component */
  return <Tooltip disabled={false} onClick={closeHandler} {...tooltipProps} />;
};

/* <CellLabel /> component */
const CellLabel: FC<{
  getCellLabelCallback: () => ReactNode | Promise<ReactNode>;
}> = ({ getCellLabelCallback }) => {
  /* hooks */
  const [label, setLabel] = useState<ReactNode | Promise<ReactNode>>(
    <Loader type="spinner" loading={true} />
  );
  useEffect(() => {
    let ignore = false;
    const callback = async () => {
      const result = (await getCellLabelCallback()) || <></>;
      if (!ignore) {
        setLabel(result);
      }
    };
    callback();
    return () => {
      ignore = true;
    };
  }, [getCellLabelCallback]);
  /* CellLabel component */
  return <>{label}</>;
};

/**
 * PlotlyWrapper
 *   The <PlotlyWrapper /> component wraps plotly <Plot /> and
 *   <TooltipInspector />.
 */
export const PlotlyWrapper = ({
  data,
  getCellLabel,
  heatMapMetaData,
  hover,
  plotlyState,
  relayoutHandler,
  setHover,
  setTooltipInspectorProps,
  setTooltipRole,
  tooltipCursorDataSetterRef,
  tooltipProps,
  tooltipRole,
}: PlotlyWrapperProps) => {
  /* hooks */
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);
  /* globals */
  if (!window.__kbase) {
    window.__kbase = {};
  }
  window.__kbase.resizeHandler = () => {
    setInnerWidth(window.innerWidth);
  };
  if (!window.__kbase.resizeListenerRegistered) {
    window.addEventListener('resize', () => {
      if (!window.__kbase.resizeHandler) return;
      return window.__kbase.resizeHandler();
    });
    window.__kbase.resizeListenerRegistered = true;
  }
  /* derived values */
  const { labels, values, headersColumn, headersRow } = data;
  const { ncols, nrows } = heatMapMetaData;
  const { plotlyWindow } = plotlyState;
  // This value is arbitrary, but should depend on innerWidth.
  const heatMapWidth = (innerWidth * 4) / 5;
  const modeBarButtonsToRemove: Plotly.ModeBarDefaultButtons[] = [
    'autoScale2d',
    'pan2d',
    'zoom2d',
    'zoomIn2d',
    'zoomOut2d',
  ];
  const config = {
    displaylogo: false,
    scrollZoom: true,
    modeBarButtonsToRemove,
  };
  const xCoords = Array(ncols)
    .fill(0)
    .map((z, ix) => ix);
  const yCoords = Array(nrows)
    .fill(0)
    .map((z, ix) => ix);
  const otherProps = { ...tooltipProps, visible: tooltipRole };
  const tickfontSizeCol = (range: number) => {
    if (170 < range) return 5;
    if (160 < range && range <= 170) return 6;
    if (130 < range && range <= 160) return 7;
    if (110 < range && range <= 130) return 8;
    if (100 < range && range <= 110) return 9;
    if (80 < range && range <= 100) return 10;
    if (70 < range && range <= 80) return 11;
    return 12;
  };
  const tickfontSizeRow = (range: number) => {
    if (50 < range) return 8;
    if (44 < range && range <= 50) return 9;
    if (38 < range && range <= 44) return 10;
    if (30 < range && range <= 38) return 11;
    return 12;
  };
  /* PlotlyWrapper component */
  return (
    <div className={classes.layout}>
      <Plot
        config={config}
        data={[
          {
            colorscale: [
              [0, '#fff'],
              [1, '#b6151c'],
            ],
            hoverinfo: 'none',
            showscale: false,
            type: 'heatmap',
            x: xCoords,
            xgap: 1,
            y: yCoords,
            ygap: 1,
            z: values,
          },
        ]}
        debug={true}
        layout={
          {
            dragmode: 'pan',
            margin: { l: 150, t: 150 },
            width: heatMapWidth,
            xaxis: {
              autotypenumbers: 'strict',
              minallowed: 0,
              maxallowed: ncols,
              range: [plotlyWindow.xMin, plotlyWindow.xMax],
              side: 'top',
              tickfont: {
                size: tickfontSizeCol(plotlyWindow.xMax - plotlyWindow.xMin),
              },
              tickmode: 'array',
              ticktext: headersColumn,
              tickvals: xCoords,
            },
            yaxis: {
              autotypenumbers: 'strict',
              minallowed: 0,
              maxallowed: nrows,
              range: [plotlyWindow.yMin, plotlyWindow.yMax],
              tickfont: {
                size: tickfontSizeRow(plotlyWindow.yMax - plotlyWindow.yMin),
              },
              tickmode: 'array',
              ticktext: headersRow,
              tickvals: yCoords,
            },
          } as Partial<Plotly.Layout>
          // The types for layout lag behind plotly's capabilities.
        }
        onClick={(evt) => {
          // TODO: fix this type. Compare:
          const pointData = evt.points[0];
          // https://github.com/DefinitelyTyped/DefinitelyTyped/blob/b3e5e59abb9cc19cc674c89fd3cc4e2275f10f7b/types/plotly.js/index.d.ts#L66-L77
          // https://github.com/plotly/plotly.js/blob/24b6f75e2d3b58cb1cd9cdd850894720404373d3/src/traces/heatmapgl/convert.js#L58
          const [rix, cix] = pointData.pointIndex as unknown as number[];
          const props = {
            clientX: evt.event.clientX + 10,
            clientY: evt.event.clientY + 10,
            meta: labels[rix][cix],
          };
          setTooltipRole(TooltipRole.inspector);
          setTooltipInspectorProps(props);
        }}
        onHover={(evt) => {
          const pointData = evt.points[0];
          const [rix, cix] = pointData.pointIndex as unknown as number[];
          const [cX, cY] = [evt.event.clientX + 10, evt.event.clientY + 10];
          if (!hover) {
            setHover(true);
          }
          if (tooltipCursorDataSetterRef?.current) {
            /* TODO: tooltip content updates */
            tooltipCursorDataSetterRef.current({
              clientX: cX,
              clientY: cY,
              meta: labels[rix][cix],
            });
          }
        }}
        onRelayout={relayoutHandler}
      />
      {/* why does typescript choke on this */}
      {/* <Plot data={data} layout={{ title: 'heatmap' }} /> */}
      {tooltipRole === TooltipRole.inspector ? (
        <TooltipInspector setTooltipRole={setTooltipRole} {...otherProps} />
      ) : (
        <></>
      )}
    </div>
  );
};

/* <HeatMap /> component */
export const HeatMap = ({
  getCellLabel,
  table,
  pageSize = 50,
}: {
  getCellLabel: HeatMapCallback['getCellLabel'];
  table: Table<HeatMapRow>;
  pageSize?: number;
}) => {
  /* Convert data from tanstack table format to Plotly format. */
  const { ncols, nrows, labels, values, headersColumn, headersRow } =
    getPlotlyFromTanstack({
      getCellLabel,
      pageSize,
      table,
    });
  /* hooks */
  const [hover, setHover] = useState(false);
  const [plotlyWindow, setPlotlyWindow] = useState({
    xMax: ncols,
    yMax: nrows,
    xMin: 0,
    yMin: 0,
  });
  useEffect(() => {
    setPlotlyWindow({ xMax: ncols, yMax: nrows, xMin: 0, yMin: 0 });
  }, [ncols, nrows]);
  const [tooltipProps, setTooltipInspectorProps] = useState({
    ...heatMapInfoDefaults,
  });
  const [tooltipRole, setTooltipRole] = useState(TooltipRole.cursor);
  // tooltip ref for updating cursor tooltip information
  const tooltipCursorDataSetterRef = useRef<TooltipDataSetter | null>(null);
  /* derived values */
  const data: HeatMapData = {
    headersColumn,
    headersRow,
    labels,
    values,
  };
  const heatMapMetaData = { ncols, nrows };
  const plotlyState = {
    plotlyWindow,
    setPlotlyWindow,
  };
  // Should the cursor tooltip be shown?
  const showTooltipCursor = tooltipRole === TooltipRole.cursor && hover;
  return (
    <div
      onMouseOut={() => {
        // Note that plotly puts a div.dragcover under the mouse on click, so
        // this will fire on click events as well unless we disable
        // pointer-events for this element.
        if (hover) {
          setHover(false);
        }
      }}
      onPointerDown={() => {
        /* TODO: handle pointerdown and allow copy/paste functionality */
      }}
      onWheel={() => {
        /* TODO: wheel cooldown/debounce */
      }}
    >
      {showTooltipCursor ? (
        <TooltipCursor
          {...tooltipProps}
          tooltipCursorDataSetterRef={tooltipCursorDataSetterRef}
          updated={false}
        />
      ) : (
        <></>
      )}
      <PlotlyWrapper
        data={data}
        getCellLabel={getCellLabel}
        heatMapMetaData={heatMapMetaData}
        hover={hover}
        plotlyState={plotlyState}
        relayoutHandler={relayoutHandlerFactory({
          heatMapMetaData,
          setHover,
          setPlotlyWindow,
          setTooltipRole,
        })}
        setTooltipInspectorProps={setTooltipInspectorProps}
        setHover={setHover}
        setTooltipRole={setTooltipRole}
        tooltipCursorDataSetterRef={tooltipCursorDataSetterRef}
        tooltipProps={tooltipProps}
        tooltipRole={tooltipRole}
      />
    </div>
  );
};
