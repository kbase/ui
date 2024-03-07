import { Column, Table } from '@tanstack/react-table';
import { FC, ReactNode, useEffect, useRef, useState } from 'react';
import Plot from 'react-plotly.js';
import type Layout from 'react-plotly.js';
import { HeatMapCell, HeatMapRow } from '../../../common/api/collectionsApi';
import { Button, Loader } from '../../../common/components';
import { noOp } from '../../common';
import classes from './HeatMap.module.scss';

/* globals */
declare global {
  interface Window {
    resizeListenerRegistered: boolean | undefined;
    resizeHandler: () => void;
  }
}

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
  values_meta: (React.ReactElement | string | null)[][];
  values_num: (number | null)[][];
  xs: string[];
  ys: string[];
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
  x: string | null;
  y: string | null;
  z: number;
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
  x: '',
  y: '',
  z: 0,
};

/* utilities */
const getNumber = ({
  value,
  valueIfNotFinite,
}: {
  value: number;
  valueIfNotFinite: number;
}) => (Number.isFinite(Number(value)) ? Number(value) : valueIfNotFinite);

/* convert the tanstack table data into the format Plotly expects */
const getPlotlyFromTanstack = ({
  table,
  getCellLabel,
}: {
  table: Table<HeatMapRow>;
  getCellLabel: HeatMapCallback['getCellLabel'];
}) => {
  const rows = table.getSortedRowModel().rows;
  const cols = table.getAllFlatColumns().filter((col) => col.parent);
  const xs: string[] = cols.map((col, cix) => {
    return col.columnDef.header as string;
  });
  const ys = rows.map((row) => row.id);
  const values_num = rows.map((row) =>
    row.getAllCells().map((cell) => cell.getValue() as number)
  );
  const values_meta = rows.map((row) => {
    const cells = row.getAllCells();
    const hmcs: HeatMapCell[] = cells.map((cell) => {
      const col_id = cell.column.id;
      const cell_id = cell.row.original.cells.filter(
        (cell_) => cell_.col_id === col_id
      )[0].cell_id;
      return {
        cell_id,
        col_id,
        val: cell.getValue() as number | boolean,
      };
    });
    return cells.map((cell, cix) => {
      const col_id = cell.column.id;
      const cell_id = cell.row.original.cells.filter(
        (cell_) => cell_.col_id === col_id
      )[0].cell_id;
      const hmc: HeatMapCell = {
        cell_id,
        col_id,
        val: cell.getValue() as number | boolean,
      };
      const hmr: HeatMapRow = {
        match: false,
        sel: false,
        kbase_id: row.id,
        kbase_display_name: row.id,
        cells: hmcs,
      };
      const getCellLabelCallback = async () =>
        await getCellLabel(hmc, hmr, cell.column);
      return <CellLabelMeta getCellLabelCallback={getCellLabelCallback} />;
    });
  });
  const ncols = xs.length;
  const nrows = ys.length;
  const output = {
    ncols,
    nrows,
    values_num,
    values_meta,
    xs,
    ys,
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
  x,
  y,
  z,
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
  x,
  y,
  z,
}) => {
  /* hooks */
  const [updatedState, setUpdatedState] = useState(updated);
  const [data, setData] = useState({
    clientX,
    clientY,
    meta,
    x,
    y,
    z,
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

/* <CellLabelMeta /> component */
const CellLabelMeta: FC<{
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
  /* CellLabelMeta component */
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
  window.resizeHandler = () => {
    setInnerWidth(window.innerWidth);
  };
  if (!window.resizeListenerRegistered) {
    window.addEventListener('resize', () => {
      return window.resizeHandler();
    });
    window.resizeListenerRegistered = true;
  }
  /* derived values */
  const { values_meta, values_num, xs, ys } = data;
  const { ncols, nrows } = heatMapMetaData;
  const { plotlyWindow } = plotlyState;
  // This value is arbitrary, but should depend on innerWidth.
  const heatMapWidth = (innerWidth * 2) / 3;
  const config = { displaylogo: false, scrollZoom: true };
  const otherProps = { ...tooltipProps, visible: tooltipRole };
  /* PlotlyWrapper component */
  return (
    <div className={classes.layout}>
      <Plot
        config={config}
        data={[
          {
            colorscale: [
              [0, '#f00'],
              [1, '#00f'],
            ],
            hoverinfo: 'none',
            type: 'heatmap',
            x: xs,
            y: ys,
            z: Array(xs.length)
              .fill(0)
              .map(() => Array(ys.length).fill(0)),
          },
          {
            colorscale: [
              [0, '#fff'],
              [1, '#b6151c'],
            ],
            hoverinfo: 'none',
            type: 'heatmap',
            x: xs,
            y: ys,
            z: values_num,
          },
        ]}
        debug={true}
        // The types for layout lag behind plotly's capabilities.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        layout={
          {
            dragmode: 'pan',
            legend: { bordercolor: '#000', borderwidth: 1 },
            width: heatMapWidth,
            xaxis: {
              autotypenumbers: 'strict',
              minallowed: 0,
              maxallowed: ncols,
              range: [plotlyWindow.xMin, plotlyWindow.xMax],
              side: 'top',
            },
            yaxis: {
              autotypenumbers: 'strict',
              minallowed: 0,
              maxallowed: nrows,
              range: [plotlyWindow.yMin, plotlyWindow.yMax],
            },
          } as Partial<Layout>
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
            meta: values_meta[rix][cix],
            x: pointData.x as string,
            y: pointData.y as string,
            z: 0,
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
              meta: values_meta[rix][cix],
              x: pointData.x as string,
              y: pointData.y as string,
              z: 0,
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
  table,
  getCellLabel,
}: {
  table: Table<HeatMapRow>;
  getCellLabel: HeatMapCallback['getCellLabel'];
}) => {
  /* Convert data from tanstack table format to Plotly format. */
  const { ncols, nrows, values_meta, values_num, xs, ys } =
    getPlotlyFromTanstack({
      getCellLabel,
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
    values_meta,
    values_num,
    xs,
    ys,
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
