import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useEffect } from 'react';
import { useAppDispatch } from '../../common/hooks';

interface PageState {
  pageTitle: string;
  environment: 'unknown' | 'production' | 'ci' | 'appdev' | 'ci-europa';
}
export const initialState: PageState = {
  pageTitle: document.title || 'KBase',
  environment: 'unknown',
};

export const pageSlice = createSlice({
  name: 'page',
  initialState,
  reducers: {
    setPageTitle: (state, action: PayloadAction<string>) => {
      state.pageTitle = action.payload;
    },
    setEnvironment: (
      state,
      action: PayloadAction<PageState['environment']>
    ) => {
      state.environment = action.payload;
    },
  },
});

export default pageSlice.reducer;
export const { setPageTitle, setEnvironment } = pageSlice.actions;

// Hook to set the page & document title. Resets the title on unmount
export const usePageTitle = (title: string) => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setPageTitle(title));
    document.title =
      title === initialState.pageTitle
        ? initialState.pageTitle
        : `${initialState.pageTitle}${title ? `: ${title}` : ''}`;
    return () => {
      dispatch(setPageTitle(initialState.pageTitle));
      document.title = initialState.pageTitle;
    };
  }, [dispatch, title]);
  return null;
};
