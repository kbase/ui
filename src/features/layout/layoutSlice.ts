import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useEffect } from 'react';
import { useAppDispatch } from '../../common/hooks';

const environments = [
  'unknown',
  'production',
  'ci',
  'appdev',
  'ci-europa',
  'narrative-dev',
] as const;

interface PageState {
  environment: typeof environments[number];
  pageTitle: string;
  modalDialogId?: string;
}

export const initialState: PageState = {
  pageTitle: document.title || 'KBase',
  environment: 'unknown',
};

export const pageSlice = createSlice({
  name: 'page',
  initialState,
  reducers: {
    setEnvironment: (state, action: PayloadAction<string>) => {
      const env = action.payload.toLowerCase();
      if (environments.includes(env as typeof environments[number])) {
        state.environment = env as typeof environments[number];
      } else {
        state.environment = 'unknown';
      }
    },
    setModalDialogId: (
      state,
      action: PayloadAction<PageState['modalDialogId']>
    ) => {
      state.modalDialogId = action.payload;
    },
    setPageTitle: (state, action: PayloadAction<string>) => {
      state.pageTitle = action.payload;
    },
  },
});

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
export default pageSlice.reducer;

export const { setEnvironment, setModalDialogId, setPageTitle } =
  pageSlice.actions;
