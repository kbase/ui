import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../common/api';
import auth from '../features/auth/authSlice';
import collections from '../features/collections/collectionsSlice';
import count from '../features/count/countSlice';
import icons from '../features/icons/iconSlice';
import layout from '../features/layout/layoutSlice';
import navigator from '../features/navigator/navigatorSlice';
import params from '../features/params/paramsSlice';
import profile from '../features/profile/profileSlice';

const createStore = <T>(additionalOptions?: T) => {
  return configureStore({
    devTools: true,
    reducer: {
      auth,
      collections,
      count,
      icons,
      layout,
      navigator,
      params,
      profile,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
    ...additionalOptions,
  });
};

export const store = createStore();

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const createTestStore = (preloadedState: Partial<RootState> = {}) => {
  return createStore({ preloadedState: preloadedState });
};
