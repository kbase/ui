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
import { LeafletMap, useLeaflet } from '../../../common/components/Map';
import {
  Pagination,
  Table,
  usePageBounds,
  useTableColumns,
} from '../../../common/components/Table';
import { useAppDispatch, useProcessStatePolling } from '../../../common/hooks';
import {
  clearAllFilters,
  setFilter,
  setLocalSelection,
  useCurrentSelection,
  useFilters,
} from '../collectionsSlice';
import classes from './../Collections.module.scss';
import { Alert, Grid, Paper, PaperProps, Stack, Link } from '@mui/material';
import { formatNumber } from '../../../common/utils/stringUtils';
import { filterContextMode, useFilterContexts } from '../Filters';
import { useTableViewParams } from '../hooks';

export const SampleAttribs: FC<{
  collection_id: string;
  mapOnly?: boolean;
  paperProps?: PaperProps;
}> = ({ collection_id, mapOnly, paperProps }) => {
  // Context
  const dispatch = useAppDispatch();

  // State Management
  const { context, columnMeta } = useFilters(collection_id);

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

  const view = {
    filtered: true,
    selected: true,
    matched: true,
    match_mark: filterContextMode(context) !== 'matched',
    selection_mark: filterContextMode(context) !== 'selected',
  };

  const viewParams = useTableViewParams(collection_id, view);

  // Requests
  const attribParams = useMemo(
    () => ({
      ...viewParams,
      // sort params
      sort_on: requestSort.by,
      sort_desc: requestSort.desc,
      // pagination params
      skip: pagination.pageIndex * pagination.pageSize,
      limit: pagination.pageSize,
    }),
    [
      viewParams,
      requestSort.by,
      requestSort.desc,
      pagination.pageIndex,
      pagination.pageSize,
    ]
  );

  const countParams = useMemo(
    () => ({ ...attribParams, count: true }),
    [attribParams]
  );
  // Current Data
  const { data, isFetching } = getSampleAttribs.useQuery(attribParams);
  const { data: countData } = getSampleAttribs.useQuery(countParams);
  const allCountParams = useMemo(
    () => ({
      ...viewParams,
      count: true,
      match_mark: true,
      selection_mark: true,
    }),
    [viewParams]
  );
  const { data: allCount } = getSampleAttribs.useQuery(allCountParams);
  const matchCountParams = useMemo(
    () => ({
      ...allCountParams,
      match_mark: false,
    }),
    [allCountParams]
  );
  const { data: matchCount } = getSampleAttribs.useQuery(matchCountParams);
  const selectCountParams = useMemo(
    () => ({
      ...allCountParams,
      selection_mark: false,
    }),
    [allCountParams]
  );
  const selectData = getSampleAttribs.useQuery(selectCountParams);

  const selectionPending = Boolean(
    !selectData.isUninitialized &&
      selectData.data?.selection_state &&
      selectData.data?.selection_state === 'processing'
  );

  useProcessStatePolling(selectData, ['selection_state']);

  useFilterContexts(collection_id, [
    {
      label: 'All',
      value: 'samples.all',
      count: allCount?.count,
    },
    {
      label: 'Matched',
      value: 'samples.matched',
      count: viewParams.match_id ? matchCount?.count : undefined,
      disabled: !viewParams.match_id,
    },
    {
      label: 'Selected',
      value: 'samples.selected',
      loading: selectData.isLoading || selectionPending,
      count:
        selectData.data?.selection_state === 'complete'
          ? selectData?.data?.count
          : undefined,
      disabled: !viewParams.selection_id || !selectData.data?.selection_state,
    },
  ]);

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
      fields: data?.fields.map((field) => ({
        id: field.name,
        displayName: columnMeta?.[field.name]?.display_name,
        render:
          field.name === 'kbase_sample_id'
            ? (value) => {
                const sampleId = (value.getValue() as string) || '';
                return (
                  <Link
                    href={`https://${process.env.REACT_APP_KBASE_DOMAIN}/legacy/samples/view/${sampleId}`}
                    target="_blank"
                  >
                    {sampleId.slice(0, 8)}...
                  </Link>
                );
              }
            : field.name === 'genome_count'
            ? (value) => {
                const count = (value.getValue() as string) || '';
                return (
                  <Link
                    href={`/collections/${collection_id}/genome_attribs/`}
                    variant={'inherit'}
                    onClick={() => {
                      dispatch(clearAllFilters([collection_id, 'genomes.all']));
                      dispatch(
                        setFilter([
                          collection_id,
                          'genomes.all',
                          'kbase_sample_id',
                          {
                            type: 'identity',
                            value: value.row.getValue('kbase_sample_id'),
                          },
                        ])
                      );
                    }}
                  >
                    {count}
                  </Link>
                );
              }
            : undefined,
      })),
      order: [
        'kbase_display_name',
        'kbase_id',
        'kbase_sample_id',
        'genome_count',
      ],
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

    enableRowSelection: false,
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
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={1}>
              <span>
                Showing {formatNumber(firstRow)} - {formatNumber(lastRow)} of{' '}
                {formatNumber(countData?.count || 0)} samples
              </span>
            </Stack>
            {context !== 'samples.all' ? (
              <Alert
                icon={false}
                variant="standard"
                severity="warning"
                sx={{
                  flexShrink: 1,
                  flexGrow: 1,
                  flexBasis: 0,
                }}
              >
                Samples associated with{' '}
                <strong>
                  {context === 'samples.selected' ? 'selected' : 'matched'}{' '}
                </strong>
                genomes
              </Alert>
            ) : (
              <></>
            )}
            <Pagination table={table} maxPage={10000 / pagination.pageSize} />
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
