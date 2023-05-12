import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  PaginationState,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import {
  getMicroTrait,
  getMicroTraitMeta,
} from '../../common/api/collectionsApi';
import { getNarratives } from '../../common/api/searchApi';
import { useAppSelector } from '../../common/hooks';
import { useAppParam } from '../params/hooks';
import { useSelectionId } from './collectionsSlice';

export const useParamsForNarrativeDropdown = (query: string) => {
  const username = useAppSelector((state) => state.auth.username);
  return useMemo<Parameters<typeof getNarratives.useQuery>[0]>(
    () => ({
      access: {
        only_public: false,
      },
      filters: {
        operator: 'OR',
        fields: [
          {
            field: 'owner',
            term: username,
          },
          {
            field: 'shared_users',
            term: username,
          },
          {
            field: 'is_narratorial',
            term: true,
          },
        ],
      },
      paging: {
        length: 30,
        offset: 0,
      },
      search: {
        query: query ? query : '*',
        fields: ['agg_fields'],
      },
      sorts: [
        ['timestamp', 'desc'],
        ['_score', 'desc'],
      ],
      types: ['KBaseNarrative.Narrative'],
    }),
    [query, username]
  );
};

// Microtrait hook stub, temporary, for figuring out all the types
export const useMicrotrait = (collection_id: string | undefined) => {
  const matchId = useAppParam('match');
  const selId = useSelectionId(collection_id || '', {
    skip: !collection_id,
  });
  const [matchMark, setMatchMark] = useState<boolean>(true);
  const [selMark, setSelMark] = useState<boolean>(true);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  });

  const heatMapParams = useMemo(
    () => ({
      collection_id: collection_id ?? '',
      ...(matchId ? { match_id: matchId, match_mark: matchMark } : {}),
      ...(selId ? { selection_id: selId, selection_mark: selMark } : {}),
    }),
    [collection_id, matchId, matchMark, selId, selMark]
  );
  const countParams = useMemo(
    () => ({ ...heatMapParams, count: true }),
    [heatMapParams]
  );
  const metaParams = useMemo(
    () => ({ collection_id: collection_id ?? '' }),
    [collection_id]
  );

  const { data: heatmap, ...heatmapQuery } = getMicroTrait.useQuery(
    heatMapParams,
    { skip: !collection_id }
  );

  const { data: count, ...countQuery } = getMicroTrait.useQuery(countParams, {
    skip: !collection_id,
  });

  const { data: meta, ...metaQuery } = getMicroTraitMeta.useQuery(metaParams, {
    skip: !collection_id,
  });

  type RowDatum = NonNullable<typeof heatmap>['data'][number];

  const cols = createColumnHelper<RowDatum>();

  const colIndex = Object.fromEntries(
    meta?.categories
      .flatMap(({ columns }) => columns.map(({ id }) => id))
      .map((id, index) => [id, index]) || []
  );

  const table = useReactTable<RowDatum>({
    data: heatmap?.data || [],
    getRowId: (row) => String(row.kbase_id),
    columns:
      meta?.categories.map((category) =>
        cols.group({
          header: category.category,
          columns: category.columns.map((col) =>
            cols.accessor((row) => row.cells[colIndex[col.id]].val, {
              header: col.name,
              id: col.id,
              meta: col,
            })
          ),
        })
      ) || [],

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableSorting: false,

    manualPagination: true,
    pageCount: Math.ceil((count?.count || 0) / pagination.pageSize),
    onPaginationChange: setPagination,

    enableRowSelection: false,

    state: {
      pagination,
    },
  });

  return {
    setMatchMark,
    setSelMark,
    setPagination,
    heatmap,
    heatmapQuery,
    count,
    countQuery,
    meta,
    metaQuery,
    table,
  };
};
