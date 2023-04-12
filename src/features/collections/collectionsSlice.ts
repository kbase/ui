import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CollectionState {
  selection: {
    id: string | undefined;
    pendingId: string | undefined;
    history: string[];
    current: string[];
  };
}

const initialState: CollectionState = {
  selection: {
    id: undefined,
    pendingId: undefined,
    current: [],
    history: [],
  },
};

export const CollectionSlice = createSlice({
  name: 'Collection',
  initialState,
  reducers: {
    setUserSelection: (
      state,
      {
        payload,
      }: PayloadAction<{
        selection: string[];
      }>
    ) => {
      if (payload.selection.length < 1) {
        // nothing selected, clear
        // clear but keep history (for debugging atm)
        state.selection = {
          ...initialState.selection,
          history: [
            ...state.selection.history,
            state.selection.id ?? '',
          ].filter(Boolean),
        };
        return;
      }

      if (selectionChanged(state.selection.current, payload.selection)) {
        if (state.selection.id)
          state.selection.history.push(state.selection.id);
        state.selection.id = undefined;
        state.selection.current = [...payload.selection];
      }
    },
    setServerSelection: (
      state,
      {
        payload,
      }: PayloadAction<{
        id: CollectionState['selection']['id'];
        selection: CollectionState['selection']['current'];
      }>
    ) => {
      if (!selectionChanged(payload.selection, state.selection.current)) {
        // don't store the server selection id unless it matches the current state and has contents
        state.selection.id = payload.id;
      }
    },
    setPendingSelectionId: (
      state,
      { payload }: PayloadAction<string | undefined>
    ) => {
      state.selection.pendingId = payload;
    },
    clearSelectionHistory: (state) => {
      state.selection.history = [];
    },
  },
});

const selectionChanged = (list1: string[], list2: string[]) =>
  list1.length !== list2.length || list1.some((upa) => !list2.includes(upa));

export default CollectionSlice.reducer;
export const {
  setUserSelection,
  setServerSelection,
  clearSelectionHistory,
  setPendingSelectionId,
} = CollectionSlice.actions;
