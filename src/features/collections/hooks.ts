import { QueryDefinition } from '@reduxjs/toolkit/dist/query';
import { UseQueryHookResult } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { ProcessState } from '../../common/api/collectionsApi';
import { getNarratives } from '../../common/api/searchApi';
import { useAppSelector, useBackoffPolling } from '../../common/hooks';
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

export const useProcessStatePolling = <
  StateKey extends string,
  Result extends { [processStateKey in StateKey]: ProcessState },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  R extends UseQueryHookResult<QueryDefinition<unknown, any, any, Result>>
>(
  result: R,
  processStateKeys: StateKey[],
  options?: { baseInterval?: number; rate?: number; skipPoll?: boolean }
): Partial<{ [processStateKey in StateKey]: ProcessState }> => {
  useBackoffPolling<R>(
    result,
    (result) => {
      for (let i = 0; i < processStateKeys.length; i++) {
        const processStateKey = processStateKeys[i];
        if (result.error || !result.data?.[processStateKey]) return false;
        if (result.data[processStateKey] === 'processing') {
          continue;
        } else if (result.data[processStateKey] === 'complete') {
          return false;
        } else if (result.data[processStateKey] === 'failed') {
          toast('ProcessState Polling Failed, see console for more info');
          // eslint-disable-next-line no-console
          console.error('ProcessState Polling Failed', { result });
          return false;
        } else {
          return false;
        }
      }
      return true;
    },
    options
  );
  const results: Partial<{ [processStateKey in StateKey]: ProcessState }> = {};
  processStateKeys.forEach((key) => {
    results[key] = result.data?.[key];
  });
  return results;
};
