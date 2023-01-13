import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

// Define a type for the slice state
class ParamsClass {
  constructor(
    readonly limit: string | null = '20',
    readonly search: string | null = null,
    readonly sort: string | null = '-updated',
    readonly view: string | null = 'data'
  ) {}
}

type ParamsState = ParamsClass;
export type ParamValid = Array<keyof ParamsState>;
export const ParamsValid: ParamValid = Object.keys(
  new ParamsClass()
) as ParamValid;
export const isValidParam = (key: string): key is keyof ParamsState =>
  ParamsValid.indexOf(key as keyof ParamsState) > -1;

// Derive the initial state
const initialState = Object.fromEntries(Object.entries(new ParamsClass()));

export const paramsSlice = createSlice({
  name: 'params',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setParams: (state, action: PayloadAction<Partial<ParamsState>>) => {
      const params = Object.keys(action.payload);
      params.forEach((param) => {
        if (isValidParam(param)) {
          state[param] = action.payload[param];
        }
      });
    },
  },
});

export default paramsSlice.reducer;
export const { setParams } = paramsSlice.actions;
// Other code such as selectors can use the imported `RootState` type
export const getParams = (state: RootState) => state.params;
