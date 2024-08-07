import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  ColumnMeta,
  createSelection,
  getSelection,
} from '../../common/api/collectionsApi';
import { parseError } from '../../common/api/utils/parseError';
import { useAppDispatch, useAppSelector } from '../../common/hooks';
import { useAppParam } from '../params/hooks';
import { useProcessStatePolling } from './hooks';

interface SelectionState {
  current: string[];
  _pendingId?: string;
  _verifiedId?: string;
}

interface MatchState {
  id?: string;
}

interface FilterRange {
  startExclusive?: boolean;
  endExclusive?: boolean;
  range: [number, number];
}

export type FilterState =
  | { type: 'fulltext' | 'prefix' | 'identity' | 'ngram'; value?: string }
  | {
      type: 'int' | 'float';
      value?: FilterRange;
      min_value: number;
      max_value: number;
    }
  | {
      type: 'date';
      value?: FilterRange;
      min_value: number;
      max_value: number;
    }
  | {
      type: 'bool';
      value?: boolean | number;
    };

interface ClnState {
  selection: SelectionState;
  match: MatchState;
  filterContext: FilterContext;
  filters: {
    [context: string]: {
      [columnName: string]: FilterState;
    };
  };
  columnMeta: {
    [context: string]: {
      [columnName: string]: ColumnMeta;
    };
  };
}

export const defaultFilterContext = 'none' as const;
export type FilterContextScope =
  | 'genomes'
  | 'samples'
  | 'biolog'
  | 'microtrait';
export type FilterContextMode = 'all' | 'matched' | 'selected';
// template literal type defining all possible filter contexts
export type FilterContext =
  | `${FilterContextScope}.${FilterContextMode}`
  | typeof defaultFilterContext;

const initialCollection: ClnState = {
  selection: { current: [] },
  match: {},
  filterContext: defaultFilterContext,
  filters: {},
  columnMeta: {},
};

export interface ContextTabsState {
  label: string;
  value: FilterContext;
  count?: number;
  disabled?: boolean;
  loading?: boolean;
}

interface CollectionsState {
  clns: { [id: string]: ClnState | undefined };
  contextTabs?: ContextTabsState[];
  filterPanelOpen: boolean;
}

const initialState: CollectionsState = {
  clns: {},
  filterPanelOpen: false,
};

export const CollectionSlice = createSlice({
  name: 'Collection',
  initialState,
  reducers: {
    setSelectionId: (
      state,
      {
        payload: [collectionId, selectionId],
      }: PayloadAction<[collectionId: string, selectionId: string | undefined]>
    ) => {
      const cln = collectionState(state, collectionId);
      cln.selection._verifiedId = selectionId;
    },
    setPendingSelectionId: (
      state,
      {
        payload: [collectionId, selectionId],
      }: PayloadAction<[collectionId: string, selectionId: string | undefined]>
    ) => {
      const cln = collectionState(state, collectionId);
      cln.selection._pendingId = selectionId;
    },
    setLocalSelection: (
      state,
      {
        payload: [collectionId, selection],
      }: PayloadAction<[collectionId: string, selection: string[]]>
    ) => {
      const cln = collectionState(state, collectionId);
      if (selectionChanged(cln.selection.current, selection)) {
        cln.selection.current = [...selection];
        cln.selection._verifiedId = undefined;
        cln.selection._pendingId = undefined;
      }
    },
    setMatchId: (
      state,
      {
        payload: [collectionId, matchId],
      }: PayloadAction<[collectionId: string, matchId: string | undefined]>
    ) => {
      const cln = collectionState(state, collectionId);
      cln.match.id = matchId;
    },
    setFilterContext: (
      state,
      {
        payload: [collectionId, context],
      }: PayloadAction<
        [collectionId: string, context: FilterContext | undefined]
      >
    ) => {
      const cln = collectionState(state, collectionId);
      if (context) {
        cln.filterContext = context;
      } else {
        cln.filterContext = defaultFilterContext;
      }
    },
    setFilterContextTabs: (
      state,
      {
        payload: [collectionId, contexts],
      }: PayloadAction<
        [collectionId: string, contexts: ContextTabsState[] | undefined]
      >
    ) => {
      state.contextTabs = contexts;
    },
    setColumnMeta: (
      state,
      {
        payload: [collectionId, context, columnName, columnMeta],
      }: PayloadAction<
        [
          collectionId: string,
          context: string,
          columnName: string,
          columnMeta: ColumnMeta
        ]
      >
    ) => {
      const cln = collectionState(state, collectionId);
      if (!cln.columnMeta[context]) cln.columnMeta[context] = {};
      cln.columnMeta[context][columnName] = columnMeta;
    },
    setFilter: (
      state,
      {
        payload: [collectionId, context, columnName, filterState],
      }: PayloadAction<
        [
          collectionId: string,
          context: string,
          columnName: string,
          filterState: FilterState
        ]
      >
    ) => {
      const cln = collectionState(state, collectionId);
      if (!cln.filters[context]) cln.filters[context] = {};
      cln.filters[context][columnName] = filterState;
    },
    clearFilter: (
      state,
      {
        payload: [collectionId, context, columnName],
      }: PayloadAction<
        [collectionId: string, context: string, columnName: string]
      >
    ) => {
      const cln = collectionState(state, collectionId);
      if (!cln.filters[context]) cln.filters[context] = {};
      if (cln.filters[context][columnName]) {
        delete cln.filters[context][columnName].value;
      }
    },
    clearAllFilters: (
      state,
      {
        payload: [collectionId, context],
      }: PayloadAction<[collectionId: string, context: string]>
    ) => {
      const cln = collectionState(state, collectionId);
      if (!cln.filters[context]) cln.filters[context] = {};
      Object.keys(cln.filters[context]).forEach((columnName) => {
        if (cln.filters[context][columnName].value) {
          delete cln.filters[context][columnName].value;
        }
      });
    },
    clearFiltersAndColumnMeta: (
      state,
      {
        payload: [collectionId, context],
      }: PayloadAction<[collectionId: string, context: string]>
    ) => {
      const cln = collectionState(state, collectionId);
      cln.filters[context] = {};
      cln.columnMeta[context] = {};
    },
    setFilterPanelOpen: (state, { payload: open }: PayloadAction<boolean>) => {
      state.filterPanelOpen = open;
    },
  },
});

const collectionState = (state: CollectionsState, collectionId: string) => {
  const cln = state.clns[collectionId];
  if (!cln) {
    // serializable deep copy
    const initCln = JSON.parse(
      JSON.stringify(initialCollection)
    ) as typeof initialCollection;
    state.clns[collectionId] = initCln;
    return initCln;
  }
  return cln;
};

const selectionChanged = (list1: string[], list2: string[]) =>
  list1.length !== list2.length || list1.some((upa) => !list2.includes(upa));

export default CollectionSlice.reducer;
export const {
  setLocalSelection,
  setSelectionId,
  setPendingSelectionId,
  setMatchId,
  setFilterContext,
  setFilterContextTabs,
  setFilter,
  clearFilter,
  clearAllFilters,
  clearFiltersAndColumnMeta,
  setColumnMeta,
  setFilterPanelOpen,
} = CollectionSlice.actions;

export const useCurrentSelection = (collectionId: string | undefined) =>
  useAppSelector((state) =>
    collectionId
      ? state.collections.clns?.[collectionId]?.selection.current
      : []
  ) ?? [];

export const useSelectionId = (collectionId: string) => {
  return useAppSelector(
    (state) => state.collections.clns[collectionId]?.selection._verifiedId
  );
};

export const useGenerateSelectionId = (
  collectionId: string,
  { skip = false }: { skip?: boolean } = {}
) => {
  const dispatch = useAppDispatch();
  const currentSelection = useCurrentSelection(collectionId);
  const selectionRef = useRef(currentSelection);
  selectionRef.current = currentSelection;
  const serializedSelection = JSON.stringify(currentSelection);
  const _pendingId = useAppSelector(
    (state) => state.collections.clns[collectionId]?.selection._pendingId
  );
  const _verifiedId = useAppSelector(
    (state) => state.collections.clns[collectionId]?.selection._verifiedId
  );

  const [createSelectionMutation] = createSelection.useMutation();

  useEffect(() => {
    //When selection changes ask for a new ID
    if (selectionRef.current.length < 1 || skip) {
      return;
    }
    const mutation = createSelectionMutation({
      collection_id: collectionId,
      selection_ids: selectionRef.current,
    });
    mutation.then((value) => {
      const { data } = { data: undefined, ...value };
      if (data) {
        dispatch(setPendingSelectionId([collectionId, data.selection_id]));
      }
    });
    return () => {
      if (
        selectionChanged(selectionRef.current, JSON.parse(serializedSelection))
      ) {
        mutation.abort();
      }
    };
  }, [
    collectionId,
    createSelectionMutation,
    serializedSelection,
    dispatch,
    skip,
  ]);

  const validateSelectionParams = useMemo(
    () => ({ selection_id: _pendingId || '' }),
    [_pendingId]
  );
  const validateSelection = getSelection.useQuery(validateSelectionParams, {
    skip: !_pendingId || !!_verifiedId,
  });

  useProcessStatePolling(validateSelection, ['state'], {
    skipPoll: !_pendingId || !!_verifiedId,
  });

  useEffect(() => {
    if (validateSelection.error)
      toast(parseError(validateSelection.error).message);
  }, [validateSelection.error]);

  useEffect(() => {
    if (validateSelection.data?.state === 'complete') {
      if (
        !selectionChanged(
          selectionRef.current,
          validateSelection.data.selection_ids
        ) &&
        _verifiedId !== validateSelection.data.selection_id
      ) {
        dispatch(
          setSelectionId([collectionId, validateSelection.data.selection_id])
        );
      }
    }
  }, [_verifiedId, collectionId, dispatch, validateSelection.data]);

  return _verifiedId;
};

export const useMatchId = (collectionId: string | undefined) => {
  const dispatch = useAppDispatch();
  const matchIdParm = useAppParam('match');
  const matchId = useAppSelector((state) =>
    collectionId ? state.collections.clns[collectionId]?.match.id : undefined
  );
  const shouldUpdate = collectionId && matchIdParm !== matchId;
  useEffect(() => {
    if (shouldUpdate) {
      dispatch(setMatchId([collectionId, matchIdParm]));
    }
  }, [collectionId, dispatch, matchIdParm, shouldUpdate]);
  return matchId;
};

export const useFilterContextState = (
  collectionId: string | undefined,
  fallback: FilterContext | undefined = defaultFilterContext
) => {
  return useAppSelector((state) =>
    collectionId
      ? state.collections.clns[collectionId]?.filterContext ?? fallback
      : fallback
  );
};

export const useFilters = (
  collectionId: string | undefined,
  filterContext?: FilterContext
) => {
  const currentContext = useFilterContextState(collectionId);
  const context = filterContext ?? currentContext;
  const filters = useAppSelector((state) =>
    collectionId
      ? state.collections.clns[collectionId]?.filters?.[context]
      : undefined
  );
  const filterPanelOpen = useAppSelector(
    (state) => state.collections.filterPanelOpen
  );
  const columnMeta = useAppSelector((state) =>
    collectionId
      ? state.collections.clns[collectionId]?.columnMeta?.[context]
      : undefined
  );

  const formattedFilters = Object.entries(filters ?? {})
    .filter(([column, filterState]) => filterState.value !== undefined)
    .map(([column, filterState]) => {
      const paramName = `filter_${column}`;
      let filterValue: string | undefined;
      if (
        filterState.type === 'identity' ||
        filterState.type === 'fulltext' ||
        filterState.type === 'prefix' ||
        filterState.type === 'ngram'
      ) {
        if (filterState.value !== undefined) filterValue = filterState.value;
      } else if (
        filterState.type === 'bool' &&
        filterState.value !== undefined
      ) {
        filterValue = Boolean(filterState.value).toString();
      } else if (
        (filterState.type === 'date' ||
          filterState.type === 'int' ||
          filterState.type === 'float') &&
        filterState.value !== undefined
      ) {
        let fStart = filterState.value.range[0].toString();
        let fEnd = filterState.value.range[1].toString();
        if (filterState.type === 'date') {
          fStart = new Date(filterState.value.range[0]).toISOString();
          fEnd = new Date(filterState.value.range[1]).toISOString();
        }
        filterValue = [
          filterState.value.startExclusive ? '(' : '[',
          fStart,
          ',',
          fEnd,
          filterState.value.endExclusive ? ')' : ']',
        ].join('');
      }
      if (filterValue === undefined) {
        throw new Error(
          `Unexpected filter value state, ${JSON.stringify(filterState)}`
        );
      }
      return [paramName, filterValue] as const;
    });
  formattedFilters.sort((a, b) => a[0].localeCompare(b[0]));
  // only update if the resulting filter text changes
  const changeIndicator = JSON.stringify(formattedFilters);
  const filterParams = useMemo(
    () => Object.fromEntries<string>(formattedFilters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [changeIndicator]
  );
  return {
    filterParams,
    context,
    filters,
    filterPanelOpen,
    columnMeta,
  };
};
