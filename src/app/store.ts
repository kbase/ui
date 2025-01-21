import { Action, combineReducers, configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../common/api';
import auth from '../features/auth/authSlice';
import collections from '../features/collections/collectionsSlice';
import icons from '../features/icons/iconSlice';
import layout from '../features/layout/layoutSlice';
import navigator from '../features/navigator/navigatorSlice';
import orcidlink from '../features/orcidlink/orcidlinkSlice';
import params from '../features/params/paramsSlice';
import profile from '../features/profile/profileSlice';
import signup from '../features/signup/SignupSlice';

const everyReducer = combineReducers({
  auth,
  collections,
  icons,
  layout,
  navigator,
  params,
  profile,
  orcidlink,
  signup,
  [baseApi.reducerPath]: baseApi.reducer,
});

const rootReducer: typeof everyReducer = (state, action) => {
  if (action.type === 'RESET_STATE') {
    return everyReducer(undefined, action);
  }

  return everyReducer(state, action);
};

const createStore = <T>(additionalOptions?: T) => {
  return configureStore({
    devTools: true,
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
    ...additionalOptions,
  });
};

export const store = createStore();

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const resetStateAction = (): Action => ({ type: 'RESET_STATE' });

export const createTestStore = (preloadedState: Partial<RootState> = {}) => {
  return createStore({ preloadedState: preloadedState });
};
