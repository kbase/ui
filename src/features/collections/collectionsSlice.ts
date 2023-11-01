import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useEffect } from 'react';
import { createSelection, getSelection } from '../../common/api/collectionsApi';
import {
  useAppDispatch,
  useAppSelector,
  useBackoffPolling,
} from '../../common/hooks';
import { useAppParam } from '../params/hooks';

interface SelectionState {
  current: string[];
  _pendingId?: string;
  _verifiedId?: string;
}

interface MatchState {
  id?: string;
}

interface ClnState {
  selection: SelectionState;
  match: MatchState;
}

interface CollectionsState {
  clns: { [id: string]: ClnState | undefined };
}

const initialCollection: ClnState = {
  selection: { current: [] },
  match: {},
};

const initialState: CollectionsState = {
  clns: {},
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
} = CollectionSlice.actions;

export const useCurrentSelection = (collectionId: string | undefined) =>
  useAppSelector((state) =>
    collectionId
      ? state.collections.clns?.[collectionId]?.selection.current
      : []
  ) ?? [];

export const useSelectionId = (
  collectionId: string,
  { skip = false }: { skip?: boolean } = {}
) => {
  const dispatch = useAppDispatch();

  const current = useCurrentSelection(collectionId);
  const _verifiedId = useAppSelector(
    (state) => state.collections.clns[collectionId]?.selection._verifiedId
  );
  const _pendingId = useAppSelector(
    (state) => state.collections.clns[collectionId]?.selection._pendingId
  );

  const [createSelectionMutation, createSelectionResult] =
    createSelection.useMutation();

  const shouldSkipCreation = skip || _verifiedId || current.length < 1;

  useEffect(() => {
    if (!shouldSkipCreation) {
      createSelectionMutation({
        collection_id: collectionId,
        selection_ids: current,
      });
    }
  }, [collectionId, createSelectionMutation, current, shouldSkipCreation]);

  useEffect(() => {
    if (!skip && createSelectionResult.data) {
      dispatch(
        setPendingSelectionId([
          collectionId,
          createSelectionResult.data.selection_id,
        ])
      );
    }
  }, [collectionId, createSelectionResult, dispatch, skip]);

  const shouldSkipValidation = skip || !_pendingId;

  const getMatchQuery = getSelection.useQuery(
    { selection_id: _pendingId || '' },
    {
      skip: shouldSkipValidation,
    }
  );
  useBackoffPolling(getMatchQuery, (result) => {
    if (result.data?.state === 'processing') return true;
    return false;
  });

  const pollDone =
    getMatchQuery.error || getMatchQuery.data?.state !== 'processing';

  useEffect(() => {
    if (pollDone) {
      dispatch(setPendingSelectionId([collectionId, undefined]));
      if (getMatchQuery.data && getMatchQuery.data.state === 'complete') {
        if (!selectionChanged(current, getMatchQuery.data.selection_ids)) {
          dispatch(
            setSelectionId([collectionId, getMatchQuery.data.selection_id])
          );
        }
      }
    }
  }, [
    collectionId,
    current,
    dispatch,
    getMatchQuery.data,
    getMatchQuery.error,
    pollDone,
  ]);

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
