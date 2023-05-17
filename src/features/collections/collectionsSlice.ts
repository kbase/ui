import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useEffect } from 'react';
import { createSelection, getSelection } from '../../common/api/collectionsApi';
import {
  useAppDispatch,
  useAppSelector,
  useBackoffPolling,
} from '../../common/hooks';

interface CollectionState {
  currentSelection: string[];
  _pendingSelectionId?: string;
  _verifiedSelectionId?: string;
}

const initialState: CollectionState = {
  currentSelection: [],
};

export const CollectionSlice = createSlice({
  name: 'Collection',
  initialState,
  reducers: {
    setSelectionId: (state, { payload }: PayloadAction<string | undefined>) => {
      state._verifiedSelectionId = payload;
    },
    setPendingSelectionId: (
      state,
      { payload }: PayloadAction<string | undefined>
    ) => {
      state._pendingSelectionId = payload;
    },
    setUserSelection: (state, { payload }: PayloadAction<string[]>) => {
      if (selectionChanged(state.currentSelection, payload)) {
        state.currentSelection = [...payload];
        state._verifiedSelectionId = undefined;
        state._pendingSelectionId = undefined;
      }
    },
  },
});

const selectionChanged = (list1: string[], list2: string[]) =>
  list1.length !== list2.length || list1.some((upa) => !list2.includes(upa));

export default CollectionSlice.reducer;
export const { setUserSelection, setSelectionId, setPendingSelectionId } =
  CollectionSlice.actions;

export const useSelectionId = (
  collectionId: string,
  { skip = false }: { skip?: boolean } = {}
) => {
  const dispatch = useAppDispatch();

  const currentSelection = useAppSelector(
    (state) => state.collections.currentSelection
  );
  const _verifiedSelectionId = useAppSelector(
    (state) => state.collections._verifiedSelectionId
  );
  const _pendingSelectionId = useAppSelector(
    (state) => state.collections._pendingSelectionId
  );

  const [createSelectionMutation, createSelectionResult] =
    createSelection.useMutation();

  const shouldSkipCreation =
    skip || _verifiedSelectionId || currentSelection.length < 1;

  useEffect(() => {
    if (!shouldSkipCreation) {
      createSelectionMutation({
        collection_id: collectionId,
        selection_ids: currentSelection,
      });
    }
  }, [
    collectionId,
    createSelectionMutation,
    currentSelection,
    shouldSkipCreation,
  ]);

  useEffect(() => {
    if (!skip && createSelectionResult.data) {
      dispatch(setPendingSelectionId(createSelectionResult.data.selection_id));
    }
  }, [createSelectionResult, dispatch, skip]);

  const shouldSkipValidation = skip || !_pendingSelectionId;

  const getMatchQuery = getSelection.useQuery(
    { selection_id: _pendingSelectionId || '' },
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
      dispatch(setPendingSelectionId(undefined));
      if (getMatchQuery.data && getMatchQuery.data.state === 'complete') {
        if (
          !selectionChanged(currentSelection, getMatchQuery.data.selection_ids)
        ) {
          dispatch(setSelectionId(getMatchQuery.data.selection_id));
        }
      } else {
        // eslint-disable-next-line no-console
        console.error(
          'Error creating selection',
          getMatchQuery.error,
          getMatchQuery.data
        );
        dispatch(setSelectionId(undefined));
      }
    }
  }, [
    currentSelection,
    dispatch,
    getMatchQuery.data,
    getMatchQuery.error,
    pollDone,
  ]);

  return _verifiedSelectionId;
};
