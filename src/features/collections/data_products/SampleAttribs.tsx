import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
  SortingState,
  RowSelectionState,
} from '@tanstack/react-table';
import { FC, useEffect, useMemo, useState } from 'react';
import {
  getSampleAttribs,
  getSampleLocations,
} from '../../../common/api/collectionsApi';
import { CheckBox } from '../../../common/components/CheckBox';
import { LeafletMap, useLeaflet } from '../../../common/components/Map';
import {
  Pagination,
  Table,
  usePageBounds,
  useTableColumns,
} from '../../../common/components/Table';
import { useAppDispatch } from '../../../common/hooks';
import {
  setLocalSelection,
  useCurrentSelection,
  useMatchId,
  useSelectionId,
} from '../collectionsSlice';
import classes from './../Collections.module.scss';
import { Grid, Paper, PaperProps, Stack } from '@mui/material';
import { formatNumber } from '../../../common/utils/stringUtils';

export const SampleAttribs: FC<{
  collection_id: string;
  mapOnly?: boolean;
  paperProps?: PaperProps;
}> = ({ collection_id, mapOnly, paperProps }) => {
  // Context
  const dispatch = useAppDispatch();

  // State Management
  const matchId = useMatchId(collection_id);
  const [matchMark, setMatchMark] = useState(true);
  const [selectMark, setSelectMark] = useState(true);
  // we don't use the server marks to show the selected state,
  // so no need to fetch the selection unless we are filtering the table
  const selectionId = useSelectionId(collection_id, { skip: selectMark });

  const [sorting, setSorting] = useState<SortingState>([]);
  const requestSort = useMemo(() => {
    return {
      by: sorting[0]?.id,
      desc: sorting[0]?.desc ?? true,
    };
  }, [sorting]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const currentSelection = useCurrentSelection(collection_id);

  // Requests
  const attribParams = useMemo(
    () => ({
      collection_id,
      sort_on: requestSort.by,
      sort_desc: requestSort.desc,
      skip: pagination.pageIndex * pagination.pageSize,
      limit: pagination.pageSize,
      ...(matchId ? { match_id: matchId, match_mark: matchMark } : {}),
      ...(selectionId
        ? { selection_id: selectionId, selection_mark: selectMark }
        : {}),
    }),
    [
      collection_id,
      matchId,
      matchMark,
      selectionId,
      selectMark,
      pagination.pageIndex,
      pagination.pageSize,
      requestSort.by,
      requestSort.desc,
    ]
  );
  const countParams = useMemo(
    () => ({ ...attribParams, count: true }),
    [attribParams]
  );
  // Current Data
  const { data, isFetching } = getSampleAttribs.useQuery(attribParams);
  const { data: countData } = getSampleAttribs.useQuery(countParams);

  // Prefetch requests
  const nextParams = useMemo(
    () => ({
      ...attribParams,
      skip: Math.min(
        (countData?.count || pagination.pageSize) - pagination.pageSize,
        attribParams.skip + pagination.pageSize
      ),
    }),
    [attribParams, countData?.count, pagination.pageSize]
  );
  getSampleAttribs.useQuery(nextParams, {
    skip: !data || !countData || isFetching,
  });
  const prevParams = useMemo(
    () => ({
      ...attribParams,
      skip: Math.max(0, attribParams.skip - pagination.pageSize),
    }),
    [attribParams, pagination.pageSize]
  );
  getSampleAttribs.useQuery(prevParams, {
    skip: !data || isFetching,
  });

  // Table setup
  const matchIndex =
    data?.fields.findIndex((f) => f.name === '__match__') ?? -1;
  const kbaseIdIndex =
    data?.fields.findIndex((f) => f.name === 'kbase_id') ?? -1;
  const sampleIdIndex =
    data?.fields.findIndex((f) => f.name === 'kbase_sample_id') ?? -1;

  const rowId = (row: unknown[]) =>
    [row[kbaseIdIndex], row[sampleIdIndex]].map(String).join('::');

  const [sampleSelection, setSelectionFromSamples] = [
    useMemo(
      () =>
        Object.fromEntries(
          currentSelection
            .flatMap((id) =>
              data?.table
                .filter((row) => row[kbaseIdIndex] === id)
                .map((row) => rowId(row))
            )
            .map((id) => [id, true])
        ),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [[...currentSelection].sort().join(', ')]
    ),
    (
      updaterOrValue:
        | RowSelectionState
        | ((old: RowSelectionState) => RowSelectionState)
    ) => {
      const value =
        typeof updaterOrValue == 'function'
          ? updaterOrValue(sampleSelection)
          : updaterOrValue;
      const idList = Object.entries(value)
        .filter(([k, v]) => v)
        .map(([k, v]) => k.split('::')[0])
        .filter((k, i, keys) => {
          return keys.indexOf(k) === i;
        });
      dispatch(setLocalSelection([collection_id, idList]));
    },
  ];

  const table = useReactTable<unknown[]>({
    data: data?.table || [],
    getRowId: (row) => rowId(row),
    columns: useTableColumns({
      fields: data?.fields.map((field) => ({ id: field.name })),
      order: ['kbase_id', 'kbase_sample_id'],
      exclude: ['__match__', '__sel__'],
    }),

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    manualSorting: true,
    onSortingChange: (update) => {
      setPagination((pgn) => ({ ...pgn, pageIndex: 0 }));
      setSorting(update);
    },
    manualPagination: true,
    pageCount: Math.ceil((countData?.count || 0) / pagination.pageSize),
    onPaginationChange: setPagination,

    enableRowSelection: true,
    onRowSelectionChange: setSelectionFromSamples,

    state: {
      sorting,
      pagination,
      rowSelection: sampleSelection,
    },
  });

  const { firstRow, lastRow } = usePageBounds(table);

  const leaflet = useLeaflet((L, leafletMap) => {
    // Map Init
    leafletMap.setView([37.87722, -122.2506], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      className: classes['grayscale'],
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(leafletMap);
  });

  const { data: locationData } = getSampleLocations.useQuery({ collection_id });
  const { leafletMap, L } = leaflet;

  const markers = useMemo(
    () =>
      locationData?.locs.flatMap((loc) => {
        if (!leafletMap) return [];
        return L.circle([loc.lat, loc.lon], {
          className: classes['circle_marker'],
          radius: 50,
        }).addTo(leafletMap);
      }),
    [L, leafletMap, locationData?.locs]
  );

  // Draw Markers
  useEffect(() => {
    if (markers?.length && markers?.length > 0) {
      leafletMap?.fitBounds(L.featureGroup(markers).getBounds());
    }
    return () =>
      markers?.forEach((marker) => {
        if (!leafletMap) return;
        if (marker) marker.removeFrom(leafletMap);
      });
  }, [L, leafletMap, markers]);

  const map = (
    <Paper variant="outlined" {...paperProps}>
      <LeafletMap height={'800px'} map={leaflet} />
    </Paper>
  );
  if (mapOnly) return map;

  return (
    <Grid container columnSpacing={1}>
      <Grid item md={6}>
        <Paper variant="outlined" {...paperProps}>
          <Stack
            className={classes['table-toolbar']}
            direction="row"
            spacing={1}
          >
            <span>
              Showing {formatNumber(firstRow)} - {formatNumber(lastRow)} of{' '}
              {formatNumber(countData?.count || 0)} genomes
            </span>
            <span>
              <CheckBox
                checked={matchMark}
                onChange={() => setMatchMark((v) => !v)}
              />{' '}
              Show Unmatched
            </span>

            <span>
              <CheckBox
                checked={selectMark}
                onChange={() => setSelectMark((v) => !v)}
              />{' '}
              Show Unselected
            </span>
          </Stack>
          <Table
            table={table}
            isLoading={isFetching}
            rowClass={(row) => {
              // match highlights
              return matchIndex !== undefined &&
                matchIndex !== -1 &&
                row.original[matchIndex]
                ? classes['match-highlight']
                : '';
            }}
          />
          <div className={classes['pagination-wrapper']}>
            <Pagination table={table} maxPage={10000 / pagination.pageSize} />
          </div>
        </Paper>
      </Grid>
      <Grid item md={6}>
        {map}
      </Grid>
    </Grid>
  );
};
