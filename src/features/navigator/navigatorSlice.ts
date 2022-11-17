import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import { Category } from './common';

// Define a type for the slice state
interface NavigatorState {
  category: Category;
  selected: string | null;
}

// Define the initial state using that type
const initialState: NavigatorState = {
  category: Category['own'],
  selected: null,
};

export const navigatorSlice = createSlice({
  name: 'navigator',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    select: (state, action: PayloadAction<NavigatorState['selected']>) => {
      console.log({ select: action.payload }); // eslint-disable-line no-console
      state.selected = action.payload;
    },
    setCategory: (state, action: PayloadAction<NavigatorState['category']>) => {
      console.log({ category: action.payload }); // eslint-disable-line no-console
      state.category = action.payload;
    },
  },
});

export default navigatorSlice.reducer;
export const { select, setCategory } = navigatorSlice.actions;
// Other code such as selectors can use the imported `RootState` type
export const navigatorSelected = (state: RootState) => state.navigator.selected;
export const categorySelected = (state: RootState) => state.navigator.category;
