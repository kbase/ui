import { useMemo } from 'react';
import { getNarratives } from '../../common/api/searchApi';
import { useAppSelector } from '../../common/hooks';
import {
  FilterContext,
  useFilters,
  useGenerateSelectionId,
  useMatchId,
} from './collectionsSlice';

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

interface TableView {
  filtered: boolean;
  selected: boolean;
  matched: boolean;
  match_mark?: boolean;
  selection_mark?: boolean;
}

export const useTableViewParams = (
  collection_id: string | undefined,
  view: TableView,
  context?: FilterContext
) => {
  const { filterParams } = useFilters(collection_id, context);
  const matchId = useMatchId(collection_id);
  const selectionId = useGenerateSelectionId(collection_id || '', {
    skip: !collection_id,
  });
  return useMemo(
    () => ({
      collection_id: collection_id ?? '',
      ...(view.filtered ? { ...filterParams } : {}),
      ...(view.selected ? { selection_id: selectionId } : {}),
      ...(view.matched ? { match_id: matchId } : {}),
      match_mark: view.match_mark,
      selection_mark: view.selection_mark,
    }),
    [
      collection_id,
      filterParams,
      matchId,
      selectionId,
      view.filtered,
      view.match_mark,
      view.matched,
      view.selected,
      view.selection_mark,
    ]
  );
};
