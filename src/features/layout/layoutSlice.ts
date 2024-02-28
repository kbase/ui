import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useEffect } from 'react';
import type { RootState } from '../../app/store';
import { useAppDispatch } from '../../common/hooks';

const environments = [
  'appdev',
  'ci',
  'ci-europa',
  'narrative-dev',
  'narrative2',
  'next',
  'production',
  'unknown',
] as const;

export interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
}

interface PageState {
  cursorListenersRegistered: boolean;
  environment: typeof environments[number];
  pageTitle: string;
  tooltip: TooltipState;
  modalDialogId?: string;
}

export const initialState: PageState = {
  cursorListenersRegistered: false,
  environment: 'unknown',
  pageTitle: document.title || 'KBase',
  tooltip: {
    visible: false,
    x: 0,
    y: 0,
  },
};

export const pageSlice = createSlice({
  name: 'page',
  initialState,
  reducers: {
    setCursorListenersRegistered: (state, action: PayloadAction<boolean>) => {
      state.cursorListenersRegistered = action.payload;
    },
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
    setTooltip: (state, action: PayloadAction<TooltipState>) => {
      console.log({ setTooltip: action.payload }); // eslint-disable-line no-console
      state.tooltip = action.payload;
      return state;
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

export const {
  setCursorListenersRegistered,
  setEnvironment,
  setModalDialogId,
  setPageTitle,
  setTooltip,
} = pageSlice.actions;

export const cursorListenersRegistered = (state: RootState) =>
  state.layout.cursorListenersRegistered;
export const tooltip = (state: RootState) => state.layout.tooltip;
