import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import { NarrativeListDoc } from '../../common/types/NarrativeDoc';
import { SearchResults } from '../../common/api/searchApi';
import { Category } from './common';

// Define a type for the slice state
interface NavigatorState {
  category: Category;
  count: number;
  narratives: NarrativeListDoc[];
  search_time: number;
  selected: string | null;
}

// Define the initial state using that type
const initialState: NavigatorState = {
  category: Category['own'],
  count: 0,
  narratives: [],
  search_time: 0,
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
    setNarratives: (
      state,
      action: PayloadAction<SearchResults['getNarratives']>
    ) => {
      state.count = action.payload.count;
      state.narratives = action.payload.hits;
      state.search_time = action.payload.search_time;
    },
  },
});

export default navigatorSlice.reducer;
export const { select, setCategory, setNarratives } = navigatorSlice.actions;
// Other code such as selectors can use the imported `RootState` type
export const categorySelected = (state: RootState) => state.navigator.category;
export const narratives = (state: RootState) => state.navigator.narratives;
export const narrativeCount = (state: RootState) => state.navigator.count;
export const navigatorSelected = (state: RootState) => state.navigator.selected;
