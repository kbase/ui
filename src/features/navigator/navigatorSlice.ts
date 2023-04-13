import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import {
  Cell,
  DataObject,
  NarrativeDoc,
} from '../../common/types/NarrativeDoc';
import { SearchResults } from '../../common/api/searchApi';
import { Category } from './common';

// Define a type for the slice state
interface NavigatorState {
  category: Category;
  cells: Cell[];
  count: number;
  narratives: NarrativeDoc[];
  search_time: number;
  selected: string | null;
  wsObjects: Record<number, DataObject[]>;
}

// Define the initial state using that type
const initialState: NavigatorState = {
  category: Category['own'],
  cells: [],
  count: 0,
  narratives: [],
  search_time: 0,
  selected: null,
  wsObjects: {},
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
    setCells: (state, action: PayloadAction<NavigatorState['cells']>) => {
      state.cells = action.payload;
    },
    setNarratives: (
      state,
      action: PayloadAction<SearchResults['getNarratives']>
    ) => {
      const hits = action.payload.hits;
      state.count = action.payload.count;
      state.narratives = hits;
      state.search_time = action.payload.search_time;
      hits.forEach(
        (hit) => (state.wsObjects[hit.access_group] = hit.data_objects)
      );
    },
  },
});

export default navigatorSlice.reducer;
export const { select, setCategory, setCells, setNarratives } =
  navigatorSlice.actions;
// Other code such as selectors can use the imported `RootState` type
export const categorySelected = (state: RootState) => state.navigator.category;
export const cells = (state: RootState) => state.navigator.cells;
export const narratives = (state: RootState) => state.navigator.narratives;
export const narrativeCount = (state: RootState) => state.navigator.count;
export const navigatorSelected = (state: RootState) => state.navigator.selected;
export const wsObjects = (state: RootState) => state.navigator.wsObjects;
