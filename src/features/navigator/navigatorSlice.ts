import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useEffect } from 'react';
import type { RootState } from '../../app/store';
import { NarrativeListDoc } from '../../common/types/NarrativeDoc';
import { useAppDispatch, useAppSelector } from '../../common/hooks';
import { Category } from './common';
// FAKE DATA
import { testItems } from './NarrativeList/NarrativeList.fixture';

// Define a type for the slice state
interface NavigatorState {
  category: Category;
  fresh: boolean;
  narratives: NarrativeListDoc[];
  selected: string | null;
}

// Define the initial state using that type
const initialState: NavigatorState = {
  category: Category['own'],
  fresh: false,
  narratives: [],
  selected: null,
};

export const navigatorSlice = createSlice({
  name: 'navigator',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    select: (state, action: PayloadAction<NavigatorState['selected']>) => {
      state.selected = action.payload;
    },
    setCategory: (state, action: PayloadAction<NavigatorState['category']>) => {
      state.category = action.payload;
    },
    setFresh: (state, action: PayloadAction<NavigatorState['fresh']>) => {
      state.fresh = action.payload;
    },
    setNarratives: (
      state,
      action: PayloadAction<NavigatorState['narratives']>
    ) => {
      if (state.fresh) return;
      state.fresh = true;
      state.narratives = action.payload;
    },
  },
});

export default navigatorSlice.reducer;
export const { select, setCategory, setFresh, setNarratives } =
  navigatorSlice.actions;
// Other code such as selectors can use the imported `RootState` type
export const categorySelected = (state: RootState) => state.navigator.category;
export const isFresh = (state: RootState) => state.navigator.fresh;
export const narratives = (state: RootState) => state.navigator.narratives;
export const navigatorSelected = (state: RootState) => state.navigator.selected;

const queryNarratives = (query?: string) => {
  const cycleLimit = [0, 11, 22][
    (new Date().getMinutes() + Math.floor(new Date().getSeconds() / 15)) % 3
  ];
  const nitems = Number(localStorage.getItem('nitems'));
  const limit = nitems ? nitems : cycleLimit;
  return testItems.slice(0, limit);
};

export const useNarratives = (query?: string) => {
  const dispatch = useAppDispatch();
  const result = queryNarratives(query);
  const narrativesPrevious = useAppSelector(narratives);
  const fresh = useAppSelector(isFresh);
  useEffect(() => {
    dispatch(setNarratives(result));
  }, [dispatch, fresh, narrativesPrevious, result]);
  return result;
};
