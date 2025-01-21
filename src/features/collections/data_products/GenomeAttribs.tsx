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
  getGenomeAttribs,
  getMatch,
  getSelection,
} from '../../../common/api/collectionsApi';
import {
  ColumnSelect,
  Pagination,
  Table,
  usePageBounds,
  useTableColumns,
} from '../../../common/components/Table';
import { useAppDispatch } from '../../../common/hooks';
import {
  setLocalSelection,
  useCurrentSelection,
  useFilters,
  useMatchId,
  useSelectionId,
} from '../collectionsSlice';
import classes from './../Collections.module.scss';
import { AttribHistogram } from './AttribHistogram';
import { AttribScatter } from './AttribScatter';
import { Grid, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { formatNumber } from '../../../common/utils/stringUtils';
import { Link } from 'react-router-dom';
import { filterContextMode, useFilterContexts } from '../Filters';
import { useProcessStatePolling, useTableViewParams } from '../hooks';
import { skipToken } from '@reduxjs/toolkit/dist/query';

export const GenomeAttribs: FC<{
  collection_id: string;
}> = ({ collection_id }) => {
  // Context
  const dispatch = useAppDispatch();

  // State Management
  const matchId = useMatchId(collection_id);
  const selectionId = useSelectionId(collection_id);
  // get the shared filter state
  const { columnMeta, context } = useFilters(collection_id);

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
  const [selection, setSelection] = [
    useMemo(
      () => Object.fromEntries(currentSelection.map((k) => [k, true])),
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
          ? updaterOrValue(selection)
          : updaterOrValue;
      dispatch(
        setLocalSelection([
          collection_id,
          Object.entries(value)
            .filter(([k, v]) => v)
            .map(([k, v]) => k),
        ])
      );
    },
  ];

  const view = {
    matched: true,
    selected: true,
    filtered: true,
    selection_mark: filterContextMode(context) !== 'selected',
    match_mark: filterContextMode(context) !== 'matched',
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

  const selectionTabLoading =
    context === 'genomes.selected' && selectionId === undefined;

  // Current Data
  const { data, isFetching } = getGenomeAttribs.useQuery(attribParams, {
    skip: selectionTabLoading,
  });
  const { count } = useGenomeAttribsCount(collection_id, view, context);
  const { count: allCount } = useGenomeAttribsCount(
    collection_id,
    {
      matched: false,
      selected: false,
      filtered: true,
    },
    'genomes.all'
  );
  const { count: matchedCount } = useGenomeAttribsCount(
    collection_id,
    {
      matched: true,
      selected: false,
      filtered: true,
    },
    'genomes.matched'
  );

  // set filter context tabs
  useFilterContexts(collection_id, [
    { label: 'All', value: 'genomes.all', count: allCount },
    {
      label: 'Matched',
      value: 'genomes.matched',
      count: matchId ? matchedCount : undefined,
      disabled: !matchId,
    },
    {
      label: 'Selected',
      value: 'genomes.selected',
      count: currentSelection.length || undefined,
      disabled: !currentSelection.length,
    },
  ]);

  // Reset Pagination when context changes
  useEffect(() => {
    setPagination((pagination) => ({ ...pagination, pageIndex: 0 }));
  }, [context]);

  // Prefetch requests
  const nextParams = useMemo(
    () => ({
      ...attribParams,
      skip: Math.min(
        (count || pagination.pageSize) - pagination.pageSize,
        attribParams.skip + pagination.pageSize
      ),
    }),
    [attribParams, count, pagination.pageSize]
  );
  getGenomeAttribs.useQuery(nextParams, {
    skip: !data || count === undefined || isFetching,
  });
  const prevParams = useMemo(
    () => ({
      ...attribParams,
      skip: Math.max(0, attribParams.skip - pagination.pageSize),
    }),
    [attribParams, pagination.pageSize]
  );
  getGenomeAttribs.useQuery(prevParams, {
    skip: !data || isFetching,
  });

  // Table setup
  const matchIndex =
    data?.fields.findIndex((f) => f.name === '__match__') ?? -1;
  const idIndex = data?.fields.findIndex((f) => f.name === 'kbase_id') ?? -1;

  const { columnDefs, columnVisibility, setColumnVisibility } = useTableColumns(
    {
      fields: data?.fields.map((field) => ({
        id: field.name,
        displayName: columnMeta?.[field.name]?.display_name ?? field.name,
        options: {
          textAlign: ['float', 'int'].includes(
            columnMeta?.[field.name]?.type ?? ''
          )
            ? 'right'
            : 'left',
        },
        render:
          field.name === 'kbase_id'
            ? (cell) => {
                // GTDB IDs are not (yet?) UPAs
                if (collection_id === 'GTDB') return cell.getValue();
                const upa = (cell.getValue() as string).replace(/_/g, '/');
                return (
                  <Link
                    to={`https://${process.env.REACT_APP_KBASE_DOMAIN}/legacy/dataview/${upa}`}
                    target="_blank"
                  >
                    {upa}
                  </Link>
                );
              }
            : // HARDCODED Special rendering for the `classification` column
            field.name === 'classification'
            ? (cell) => {
                return (
                  <Tooltip
                    title={`${cell.getValue()}`}
                    placement="top"
                    arrow
                    enterDelay={800}
                  >
                    <Typography
                      sx={{
                        direction: 'rtl',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {cell.getValue() as string}
                    </Typography>
                  </Tooltip>
                );
              }
            : undefined,
      })),
      // HARDCODED the field order parameter and the hidden fields parameter hardcode overrides for which columns will appear and in what order
      // GTDB has different column names (#4)
      order: ['kbase_display_name', 'kbase_id', 'genome_size'],
      exclude: ['__match__', '__sel__'],
      defaultVisible: [
        // GROW / ENIGMA / PMI
        'kbase_display_name',
        'kbase_id',
        'completeness',
        'contamination',
        'classification',
        'classification_method',
        'kbase_gc_content',
        'kbase_genome_size',
        'kbase_num_protein_encoding_genes',
        'kbase_num_cds',
        'kbase_num_contigs',
        // GTDB special-casing
        'accession',
        'gtdb_taxonomy',
        'checkm_completeness',
        'checkm_contamination',
        'genome_size',
        'gc_percentage',
        'mimag_high_quality',
        'mimag_medium_quality',
        'mimag_low_quality',
        'ncbi_assembly_level',
        'ncbi_bioproject',
        'ncbi_biosample',
        'ncbi_date',
        'ncbi_organism_name',
        'protein_count',
        'trna_count',
        'gtdb_representative',
        'gtdb_type_species_of_genus',
      ],
    }
  );

  const table = useReactTable<unknown[]>({
    data: data?.table || [],
    getRowId: (row) => String(row[idIndex]),
    columns: columnDefs,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    manualSorting: true,
    onSortingChange: (update) => {
      setPagination((pgn) => ({ ...pgn, pageIndex: 0 }));
      setSorting(update);
    },
    manualPagination: true,
    pageCount: Math.ceil((count || 0) / pagination.pageSize),
    onPaginationChange: setPagination,

    enableRowSelection: true,
    onRowSelectionChange: setSelection,

    onColumnVisibilityChange: setColumnVisibility,

    state: {
      sorting,
      pagination,
      rowSelection: selection,
      columnVisibility,
    },
  });

  const { firstRow, lastRow } = usePageBounds(table);

  return (
    <Grid container spacing={1}>
      <Grid item md={6}>
        <Paper
          elevation={0}
          sx={{
            height: '350px',
            minWidth: '350px',
            padding: '1px',
            position: 'relative',
            width: '100%',
          }}
        >
          {/* HARDCODED Plots are currently hardcoded for certain columns in the existing collections schema */}
          <AttribScatter
            collection_id={collection_id}
            xColumn={
              // GTDB has different column names (#1)
              collection_id === 'GTDB' ? 'checkm_completeness' : 'Completeness'
            }
            yColumn={
              // GTDB has different column names (#2)
              collection_id === 'GTDB'
                ? 'checkm_contamination'
                : 'Contamination'
            }
          />
        </Paper>
      </Grid>
      <Grid item md={6}>
        <Paper
          elevation={0}
          sx={{
            height: '350px',
            minWidth: '350px',
            padding: '1px',
            position: 'relative',
            width: '100%',
          }}
        >
          {/* HARDCODED Plots are currently hardcoded for certain columns in the existing collections schema */}
          <AttribHistogram
            collection_id={collection_id}
            column={
              // GTDB has different column names (#3)
              collection_id === 'GTDB' ? 'checkm_completeness' : 'Completeness'
            }
          />
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper elevation={0}>
          <Stack
            className={classes['table-toolbar']}
            direction="row"
            spacing={1}
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <span>
                Showing {formatNumber(firstRow)} - {formatNumber(lastRow)} of{' '}
                {formatNumber(count || 0)} samples
              </span>
              <ColumnSelect
                columnMeta={columnMeta}
                columnVisibility={columnVisibility}
                setColumnVisibility={setColumnVisibility}
              />
            </Stack>
            <Pagination table={table} maxPage={10000 / pagination.pageSize} />
          </Stack>
          <Table
            table={table}
            isLoading={isFetching || selectionTabLoading}
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
    </Grid>
  );
};

export const useGenomeAttribsCount = (
  ...[collection_id, view, context]: Parameters<typeof useTableViewParams>
) => {
  const viewParams = useTableViewParams(collection_id, view, context);
  const params = useMemo(() => ({ ...viewParams, count: true }), [viewParams]);

  // Requests
  const result = getGenomeAttribs.useQuery(params, {
    skip: !collection_id,
  });

  // Refetch count when the match changes and is done processing
  const match = getMatch.useQuery(params.match_id ?? skipToken);
  useProcessStatePolling(match, ['state']);

  useEffect(() => {
    if (match.data?.state === 'complete') {
      result.refetch();
    }
  }, [match.data?.state, result]);

  // Refetch count when the selection changes and is done processing
  const selParams = useMemo(
    () =>
      params.selection_id !== undefined
        ? {
            selection_id: params.selection_id,
          }
        : skipToken,
    [params.selection_id]
  );
  const selection = getSelection.useQuery(selParams);
  useProcessStatePolling(selection, ['state']);

  useEffect(() => {
    if (selection.data?.state === 'complete') {
      result.refetch();
    }
  }, [selection.data?.state, result]);

  return { count: result?.currentData?.count, result };
};
