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
  cellsLoaded: boolean;
  count: number;
  narrativeDocs: NarrativeDoc[];
  narrativeDocsLookup: Record<number, NarrativeDoc>;
  search_time: number;
  selected: string | null;
  users: Record<string, string>;
  wsObjects: Record<number, DataObject[]>;
}

// Define the initial state using that type
const initialState: NavigatorState = {
  category: Category['own'],
  cells: [],
  cellsLoaded: false,
  count: 0,
  narrativeDocs: [],
  narrativeDocsLookup: {},
  search_time: 0,
  selected: null,
  users: {},
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
      state.cellsLoaded = true;
    },
    setCellsLoaded: (
      state,
      action: PayloadAction<NavigatorState['cellsLoaded']>
    ) => {
      state.cellsLoaded = action.payload;
    },
    setNarrativeDocs: (
      state,
      action: PayloadAction<SearchResults['getNarratives']>
    ) => {
      const hits = action.payload.hits;
      state.count = action.payload.count;
      state.narrativeDocs = hits;
      state.search_time = action.payload.search_time;
      hits.forEach((hit) => {
        state.wsObjects[hit.access_group] = hit.data_objects;
        state.narrativeDocsLookup[hit.access_group] = hit;
      });
    },
    updateUsers: (state, action: PayloadAction<NavigatorState['users']>) => {
      state.users = { ...state.users, ...action.payload };
    },
  },
});

export default navigatorSlice.reducer;
export const {
  select,
  setCategory,
  setCells,
  setCellsLoaded,
  setNarrativeDocs,
  updateUsers,
} = navigatorSlice.actions;
// Other code such as selectors can use the imported `RootState` type
export const categorySelected = (state: RootState) => state.navigator.category;
export const cells = (state: RootState) => state.navigator.cells;
export const cellsLoaded = (state: RootState) => state.navigator.cellsLoaded;
export const narrativeDocs = (state: RootState) =>
  state.navigator.narrativeDocs;
export const narrativeDocsLookup = (state: RootState) =>
  state.navigator.narrativeDocsLookup;
export const narrativeDocsCount = (state: RootState) => state.navigator.count;
export const navigatorSelected = (state: RootState) => state.navigator.selected;
export const users = (state: RootState) => state.navigator.users;
export const wsObjects = (state: RootState) => state.navigator.wsObjects;
