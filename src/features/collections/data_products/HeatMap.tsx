import { Column, Table } from '@tanstack/react-table';
//import { FC, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { FC, ReactNode, useEffect, useRef, useState } from 'react';
import Plot from 'react-plotly.js';
import type Layout from 'react-plotly.js';
import { HeatMapCell, HeatMapRow } from '../../../common/api/collectionsApi';
import { Button } from '../../../common/components';
import classes from './HeatMap.module.scss';

declare global {
  interface Window {
    values_num: (number | null)[][];
  }
}

export const MAX_HEATMAP_PAGE = 10000;

const getNumber = ({
  value,
  valueIfNotFinite,
}: {
  value: number;
  valueIfNotFinite: number;
}) => (Number.isFinite(Number(value)) ? Number(value) : valueIfNotFinite);

export interface HeatMapCallback {
  getCellLabel: (
    cell: HeatMapCell,
    row: HeatMapRow,
    column: Column<HeatMapRow, unknown>
  ) => ReactNode | Promise<ReactNode>;
}

enum TooltipVisibleState {
  cursor = 'cursor',
  inspector = 'inspector',
}

interface HeatMapMetadata {
  clientX: number;
  clientY: number;
  meta: React.ReactElement | string | null;
  x: string | null;
  y: string | null;
  z: number;
}

type HeatMapMetadataSetter = React.Dispatch<
  React.SetStateAction<HeatMapMetadata>
>;

interface HeatMapTooltipCursorProps extends HeatMapMetadata {
  updated: boolean;
  tooltipCursorMetaDataSetterRef?: React.MutableRefObject<HeatMapMetadataSetter | null>;
}

export const HeatMapTooltipCursor: FC<HeatMapTooltipCursorProps> = ({
  clientX,
  clientY,
  meta,
  tooltipCursorMetaDataSetterRef,
  updated,
  x,
  y,
  z,
}) => {
  const [updatedState, setUpdatedState] = useState(updated);
  const [data, setData] = useState({
    clientX,
    clientY,
    meta,
    x,
    y,
    z,
  });
  const {
    clientX: clientXValue,
    clientY: clientYValue,
    meta: metaValue,
  } = data;
  const setter = (value: React.SetStateAction<HeatMapMetadata>) => {
    setUpdatedState(true);
    setData(value);
  };
  /* setter set here */
  if (
    tooltipCursorMetaDataSetterRef &&
    Object.hasOwn(tooltipCursorMetaDataSetterRef, 'current')
  ) {
    tooltipCursorMetaDataSetterRef.current = setter;
  }
  if (!updatedState) {
    return <></>;
  }
  return (
    <>
      <div
        className={classes.tooltip}
        style={{
          left: clientXValue,
          pointerEvents: 'none',
          top: clientYValue,
        }}
      >
        <pre>cursor</pre>
        {metaValue}
      </div>
    </>
  );
};

interface HeatMapTooltipProps extends HeatMapMetadata {
  setTooltipState: React.Dispatch<React.SetStateAction<TooltipVisibleState>>;
}

export const HeatMapTooltipInspector: FC<HeatMapTooltipProps> = ({
  clientX,
  clientY,
  meta,
  setTooltipState,
  x,
  y,
  z,
}) => {
  const closeHandler = () => {
    console.log('set tooltip state to cursor'); // eslint-disable-line no-console
    setTooltipState(TooltipVisibleState.cursor);
  };
  return (
    <>
      <div
        className={classes.tooltip}
        style={{
          left: clientX,
          top: clientY,
        }}
      >
        <pre>inspector</pre>
        {meta}
        <Button onClick={closeHandler}>Close</Button>
      </div>
    </>
  );
};

/**
 * Plotly HeatMap viz
 */
interface HeatMapData {
  values_bool: (number | null)[][];
  values_meta: (React.ReactElement | string | null)[][];
  values_num: (number | null)[][];
  xs: string[];
  ys: string[];
}

interface PlotWindow {
  xMax: number;
  yMax: number;
  xMin: number;
  yMin: number;
}

interface PlotState {
  plotWindow: PlotWindow;
  setPlotWindow: React.Dispatch<React.SetStateAction<PlotWindow>>;
}

const getFakeData = (ncols: number, nrows: number) => {
  const values_num = Array(nrows)
    .fill(0)
    .map((row, rix) =>
      Array(ncols)
        .fill(0)
        .map((col, cix) => (cix < 260 ? (rix * cix) % 100 : null))
    ); //table.table.data,
  const values_bool = Array(nrows)
    .fill(0)
    .map((row, rix) =>
      Array(ncols)
        .fill(0)
        .map((col, cix) =>
          cix < 260 ? null : 100 * Math.round(((rix * cix) % 100) / 100)
        )
    ); //table.table.data,
  const values_meta = Array(nrows)
    .fill('')
    .map((row, rix) =>
      Array(ncols)
        .fill('')
        .map((col, cix) => `${values_num[rix][cix]}${values_bool[rix][cix]}`)
    );
  window.values_num = values_num;
  const letters = Object.fromEntries(
    'abcdefghij'.split('').map((el, ix) => [`${ix}`, el])
  );
  const xs = Array(ncols)
    .fill(0)
    .map((el, ix) =>
      Math.sin(ix)
        .toString()
        .slice(5, 10)
        .split('')
        .map((el) => letters[el])
        .join('')
    );
  const ys = Array(nrows)
    .fill(0)
    .map((el, ix) =>
      Math.cos(ix)
        .toString()
        .slice(5, 10)
        .split('')
        .map((el) => letters[el])
        .join('')
    );
  return {
    values_bool,
    values_meta,
    values_num,
    xs,
    ys,
  };
};

const relayoutHandlerFactory =
  ({
    cooldownRelayoutRef,
    plotMeta,
    setHover,
    setPlotWindow,
    setTooltipState,
    waitUntilCool,
  }: {
    cooldownRelayoutRef: React.MutableRefObject<Cooldown>;
    plotMeta: PlotMeta;
    setHover: React.Dispatch<React.SetStateAction<boolean>>;
    setPlotWindow: PlotState['setPlotWindow'];
    setTooltipState: React.Dispatch<React.SetStateAction<TooltipVisibleState>>;
    waitUntilCool: ({
      ref,
    }: {
      ref: React.MutableRefObject<Cooldown>;
    }) => boolean;
  }) =>
  (evt: Readonly<Plotly.PlotRelayoutEvent>) => {
    console.log('event relayout'); // eslint-disable-line no-console
    /*
    if (cooldownRelayoutRef.current.hot) {
      console.log('too hot for relayout'); // eslint-disable-line no-console
      return;
    }
    if (waitUntilCool({ ref: cooldownRelayoutRef })) {
      console.log('relayout cooling off'); // eslint-disable-line no-console
      return;
    }
    console.log('cooldownRelayoutRef is HOT: relayout'); // eslint-disable-line no-console
    cooldownRelayoutRef.current.hot = true;
    */
    const { ncols, nrows } = plotMeta;
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
    const newPlotWindow = {
      xMax,
      yMax,
      xMin,
      yMin,
    };
    console.log(newPlotWindow); // eslint-disable-line no-console
    setHover(false);
    setPlotWindow(newPlotWindow);
    //setTooltipState(TooltipVisibleState.cursor);
  };

interface Cooldown {
  timer: ReturnType<typeof setTimeout> | null;
  hot: boolean;
}

const heatMapInfoDefaults: HeatMapMetadata = {
  clientX: 0,
  clientY: 0,
  meta: '',
  x: '',
  y: '',
  z: 0,
};

const CellLabelMeta: FC<{
  getCellLabelCallback: () => ReactNode | Promise<ReactNode>;
}> = ({ getCellLabelCallback }) => {
  const [label, setLabel] = useState<ReactNode | Promise<ReactNode>>(<></>);
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
  return <>{label}</>;
};

const plotlyFromTable = ({
  table,
  getCellLabel,
}: {
  table: Table<HeatMapRow>;
  getCellLabel: HeatMapCallback['getCellLabel'];
}) => {
  const rows = table.getSortedRowModel().rows;
  const cols = table.getAllFlatColumns().filter((col) => col.parent);
  const xs: string[] = cols.map((col, cix) => {
    if (cix === 13) {
      console.log({ col }); // eslint-disable-line no-console
    }
    return col.columnDef.header as string;
  });
  const ys = rows.map((row) => row.id);
  const values_num = rows.map((row) =>
    row.getAllCells().map((cell) => cell.getValue() as number)
  );
  const values_meta = rows.map(
    (row) => {
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
        if (row.index === 13 && cix === 17) {
          // eslint-disable-next-line no-console
          console.log({
            cell,
            value: cell.getValue(),
            label: getCellLabel(hmc, hmr, cell.column),
          });
        }
        const getCellLabelCallback = async () =>
          await getCellLabel(hmc, hmr, cell.column);
        return <CellLabelMeta getCellLabelCallback={getCellLabelCallback} />;
      });
    }
    // row.getAllCells().map((cell) => `${row.getValue(cell.id)}`)
  );
  /*
   */
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
  console.log({ output }); // eslint-disable-line no-console
  return output;
};

export const HeatMap = ({
  table,
  rowNameAccessor,
  getCellLabel,
}: {
  table: Table<HeatMapRow>;
  rowNameAccessor: (row: HeatMapRow, index: number) => string;
  getCellLabel: HeatMapCallback['getCellLabel'];
}) => {
  const [heatMapTooltipProps, setHeatMapTooltipProps] = useState({
    ...heatMapInfoDefaults,
  });
  const [tooltipState, setTooltipState_] = useState(TooltipVisibleState.cursor);
  const cooldownRelayoutRef = useRef<Cooldown>({
    timer: null,
    hot: false,
  });
  const cooldownWheelRef = useRef<Cooldown>({
    timer: null,
    hot: false,
  });
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setTooltipState = (
    value: React.SetStateAction<TooltipVisibleState>
  ) => {
    console.log(`setTooltipState wrapper: set ${value}`); // eslint-disable-line no-console
    //console.log('setTooltipState', { value }); // eslint-disable-line no-console
    return setTooltipState_(value);
  };
  const [hover, setHover] = useState(false);
  /* BEGIN DATA (values_bool fake currently) */
  /*
  const { ncols, nrows, values_meta, values_num, xs, ys } = useMemo(
    () =>
      plotlyFromTable({
        table,
      }),
    [table]
  );
  */
  const { ncols, nrows, values_meta, values_num, xs, ys } = plotlyFromTable({
    getCellLabel,
    table,
  });
  const NCOLS = 300;
  const NROWS = 100;
  const { values_bool } = getFakeData(NCOLS, NROWS);
  // const [ncols, nrows] = [xs.length, ys.length];
  const plotMeta = { ncols, nrows };
  const [plotWindow, setPlotWindow] = useState({
    xMax: ncols,
    yMax: nrows,
    xMin: 0,
    yMin: 0,
  });
  useEffect(() => {
    setPlotWindow({ xMax: ncols, yMax: nrows, xMin: 0, yMin: 0 });
  }, [ncols, nrows]);
  const plotState = {
    plotWindow,
    setPlotWindow,
  };
  const data: HeatMapData = {
    values_bool,
    values_meta,
    values_num,
    xs,
    ys,
  };
  /*
  const data: HeatMapData = useMemo(
    () => ({
      values_bool,
      values_meta,
      values_num,
      xs,
      ys,
    }),
    [values_bool, values_meta, values_num, xs, ys]
  );
  */
  /* END DATA (fake currently) */

  const tooltipCursorMetaDataSetterRef = useRef<HeatMapMetadataSetter | null>(
    null
  );
  //tooltipCursorMetaDataSetterRef.current = {} as HeatMapMetadataSetter;

  //Should the cursor tooltip be shown?
  const showTooltipCursor =
    tooltipState === TooltipVisibleState.cursor && hover;
  const blowOnIt = ({ ref }: { ref: React.MutableRefObject<Cooldown> }) =>
    setTimeout(() => {
      console.log(`ok now it's cool`); // eslint-disable-line no-console
      ref.current.hot = false;
    }, 250);
  const waitUntilCool = ({
    ref,
  }: {
    ref: React.MutableRefObject<Cooldown>;
  }) => {
    console.log('too hot?'); // eslint-disable-line no-console
    if (ref.current.timer) {
      console.log('now try'); // eslint-disable-line no-console
      clearTimeout(ref.current.timer);
      return false;
    }
    console.log('blow on it'); // eslint-disable-line no-console
    cooldownTimerRef.current = blowOnIt({ ref });
    return true;
  };
  /*
    TODO: update plotWindow for onMouseOut and onClick events
      one step forward and one step back amirite
   */
  console.log(`event render HeatMap: ${tooltipState}`); // eslint-disable-line no-console
  return (
    <div
      onDragStart={() => {
        // eslint-disable-next-line no-console
        console.log('event <HeatMap /> div DragStart');
      }}
      onMouseOut={() => {
        // Note that plotly puts a div.dragcover under the mouse on click, so
        // this will fire on click events as well unless we disable
        // pointer-events for this element.
        if (hover) {
          setHover(false);
        }
        console.log('event mouseout'); // eslint-disable-line no-console
      }}
      onPointerDown={() => {
        // eslint-disable-next-line no-console
        console.log('event <HeatMap /> div PointerDown');
        setTooltipState(TooltipVisibleState.cursor);
      }}
      onWheel={() => {
        // eslint-disable-next-line no-console
        console.log('event <HeatMap /> div Wheel');
        if (tooltipState === TooltipVisibleState.cursor) {
          // console.log('one per customer'); // eslint-disable-line no-console
          return;
        }
        if (cooldownWheelRef.current.hot) {
          console.log('Hot Wheels!'); // eslint-disable-line no-console
          return;
        }
        if (waitUntilCool({ ref: cooldownWheelRef })) {
          console.log('soon!'); // eslint-disable-line no-console
          return;
        }
        console.log('tooltipStateHot is HOT: wheel'); // eslint-disable-line no-console
        cooldownWheelRef.current = {
          hot: true,
          timer: blowOnIt({ ref: cooldownWheelRef }),
        };
        setTooltipState(TooltipVisibleState.cursor);
      }}
    >
      {showTooltipCursor ? (
        <HeatMapTooltipCursor
          {...heatMapTooltipProps}
          updated={false}
          tooltipCursorMetaDataSetterRef={tooltipCursorMetaDataSetterRef}
        />
      ) : (
        <></>
      )}
      <HeatMapInner
        data={data}
        getCellLabel={getCellLabel}
        heatMapTooltipProps={heatMapTooltipProps}
        hover={hover}
        plotMeta={plotMeta}
        plotState={plotState}
        relayoutHandler={relayoutHandlerFactory({
          cooldownRelayoutRef,
          plotMeta,
          setHover,
          setPlotWindow,
          setTooltipState,
          waitUntilCool,
        })}
        rowNameAccessor={rowNameAccessor}
        setHeatMapTooltipProps={setHeatMapTooltipProps}
        setHover={setHover}
        setTooltipState={setTooltipState}
        table={table}
        tooltipCursorMetaDataSetterRef={tooltipCursorMetaDataSetterRef}
        tooltipState={tooltipState}
      />
    </div>
  );
};

interface PlotMeta {
  ncols: number;
  nrows: number;
}

interface HeatMapInnerProps {
  data: HeatMapData;
  getCellLabel: HeatMapCallback['getCellLabel'];
  heatMapTooltipProps: HeatMapMetadata;
  hover: boolean;
  plotMeta: PlotMeta;
  plotState: PlotState;
  relayoutHandler: (evt: Readonly<Plotly.PlotRelayoutEvent>) => void;
  rowNameAccessor: (row: HeatMapRow, index: number) => string;
  setHover: React.Dispatch<React.SetStateAction<boolean>>;
  setTooltipState: React.Dispatch<React.SetStateAction<TooltipVisibleState>>;
  setHeatMapTooltipProps: React.Dispatch<React.SetStateAction<HeatMapMetadata>>;
  table: Table<HeatMapRow>;
  tooltipState: TooltipVisibleState;
  tooltipCursorMetaDataSetterRef?: React.MutableRefObject<HeatMapMetadataSetter | null>;
}

/**
 * Generic Collections HeatMap viz
 */
export const HeatMapInner = ({
  data,
  getCellLabel,
  heatMapTooltipProps,
  hover,
  plotMeta,
  plotState,
  relayoutHandler,
  rowNameAccessor,
  setHeatMapTooltipProps,
  setHover,
  setTooltipState,
  table,
  tooltipCursorMetaDataSetterRef,
  tooltipState,
}: HeatMapInnerProps) => {
  const [innerWidth, setInnerWidth] = useState(window.innerWidth);
  window.addEventListener('resize', () => setInnerWidth(window.innerWidth));
  useEffect(() => {
    console.log({ innerWidth }); // eslint-disable-line no-console
  }, [innerWidth]);

  const { values_meta, values_num, xs, ys } = data;
  const { ncols, nrows } = plotMeta;
  const { plotWindow } = plotState;
  const heatMapWidth = (innerWidth * 2) / 3;
  // eslint-disable-next-line no-console
  console.log('event render HeatMapInner', {
    table,
    tooltipState,
  });
  const config = { displaylogo: false, scrollZoom: true };
  const otherProps = { ...heatMapTooltipProps, visible: tooltipState };
  return (
    <div className={classes.layout}>
      <Plot
        config={config}
        data={[
          {
            colorbar: {
              tickmode: 'array',
              ticktext: ['false', 'true'],
              tickvals: [0, 100],
              thickness: 0,
              xpad: 30,
            },
            colorscale: [
              [0, 'rgb(255,0,0)'],
              [1, 'rgb(0,0,255)'],
            ],
            hoverinfo: 'none',
            type: 'heatmap',
            x: xs,
            y: ys,
            z: Array(xs.length)
              .fill(0)
              .map(() => Array(ys.length).fill(0)),
            /*
            x: xs,
            y: ys,
            z: values_bool,
          */
          },
          {
            colorbar: {
              tickmode: 'array',
              ticktext: ['a', 'b', 'c'],
              tickvals: [1, 50, 99],
              thickness: 0,
            },
            colorscale: [
              [0, 'rgb(255,0,255)'],
              [1, 'rgb(0,255,0)'],
            ],
            hoverinfo: 'none',
            type: 'heatmap',
            x: xs, //.map((el) => el.slice(0, 260)),
            y: ys,
            z: values_num, //.map((el) => el.slice(0, 260)),
          },
        ]}
        debug={true}
        // The types for layout lag behind plotly's capabilities.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        layout={
          {
            dragmode: 'pan',
            // height: heatMapHeight,
            /*
            hoverlabel: {
              bgcolor: '#ff0',
            },
            */
            legend: { bordercolor: '#000', borderwidth: 1 },
            title: { text: 'heatmap' },
            width: heatMapWidth,
            xaxis: {
              autotypenumbers: 'strict',
              minallowed: 0,
              maxallowed: ncols,
              range: [plotWindow.xMin, plotWindow.xMax],
              side: 'top',
              // ticklabelposition: 'inside top',
            },
            yaxis: {
              autotypenumbers: 'strict',
              minallowed: 0,
              maxallowed: nrows,
              range: [plotWindow.yMin, plotWindow.yMax],
            },
          } as Partial<Layout>
        }
        onClick={(evt) => {
          console.log('event CLICK!!!!!'); // eslint-disable-line no-console
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
          setTooltipState(TooltipVisibleState.inspector);
          console.log('setHeatMapTooltipProps', props); // eslint-disable-line no-console
          setHeatMapTooltipProps(props);
        }}
        onHover={(evt) => {
          console.log('event hover'); // eslint-disable-line no-console
          const pointData = evt.points[0];
          const [rix, cix] = pointData.pointIndex as unknown as number[];
          const [cX, cY] = [evt.event.clientX + 10, evt.event.clientY + 10];
          console.log({ pi: pointData.pointIndex, cX, cY }); // eslint-disable-line no-console
          if (!hover) {
            setHover(true);
          }
          if (tooltipCursorMetaDataSetterRef?.current) {
            /*
          probably not needed
          if (
            tooltipCursorMetaDataSetterRef &&
            Object.hasOwn(tooltipCursorMetaDataSetterRef, 'current')
          ) {
           */
            // eslint-disable-next-line no-console
            console.log({
              typeof: typeof tooltipCursorMetaDataSetterRef.current,
              value: tooltipCursorMetaDataSetterRef.current,
            });
            tooltipCursorMetaDataSetterRef.current({
              clientX: cX,
              clientY: cY,
              // hover: true,
              meta: values_meta[rix][cix],
              // visible: TooltipVisibleState.cursor,
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
      {tooltipState === TooltipVisibleState.inspector ? (
        <HeatMapTooltipInspector
          setTooltipState={setTooltipState}
          {...otherProps}
        />
      ) : (
        <></>
      )}
    </div>
  );
};
