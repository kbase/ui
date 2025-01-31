import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { generatePath } from 'react-router-dom';
import type { RootState } from '../../app/store';

// Define a type for the slice state
class ParamsClass {
  constructor(
    // For Auth/Login/Linking
    readonly nextRequest: string | null = null,
    // Search
    readonly limit: string | null = '20',
    readonly search: string | null = null,
    readonly sort: string | null = '-updated',
    readonly view: string | null = 'data',
    // Matching
    readonly match: string | null = null,
    // Orcidlink
    readonly sessionId: string | null = null,
    //
    // Search parameter whitelist for kbase-ui and plugins. If one encounters a
    // search parameter which is mysteriously disappearing or causing a route to
    // fail, add it here.
    //
    // Current behavior for legacy endpoints is that, without whitelisting
    // search parameters, the parameter is "seen" by the legacy component, but
    // Europa will remove it from the location bar. This breaks page reloading
    // or url capture, even though technically kbase-ui and it's plugins will
    // receive the initial search parameters.
    //
    // For search
    readonly q: string | null = null,
    // For narrative opening
    readonly n: string | null = null,
    readonly check: string | null = null,
    // For kbase-ui navigation via auth in an iframe
    readonly nextrequest: string | null = null,
    readonly source: string | null = null,
    // for account management ui
    readonly tab: string | null = null,
    // for landing pages
    readonly sub: string | null = null,
    readonly subid: string | null = null,
    // orcidlink linking params
    readonly skip_prompt: string | null = null,
    readonly ui_options: string | null = null,
    readonly return_link: string | null = null,
    // orcid link error redirect
    readonly code: string | null = null,
    readonly message: string | null = null
  ) {}
}

export type ParamsState = ParamsClass;
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
      ParamsValid.forEach((param) => {
        state[param] = action.payload[param] || initialState[param];
      });
    },
  },
});

// Take a path specification and create a url to that pathname including the
// URL search parameters specified in params
export const generatePathWithSearchParams = (
  pathSpec: string,
  params: Record<string, string>
) => {
  const path = generatePath(pathSpec, params);
  const paramsInPathSpec = Array.from(pathSpec.matchAll(/:\w+/g)).map(
    ([match]) => match.slice(1)
  );
  const pathSearchParams = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(
        ([param, value]) =>
          paramsInPathSpec.indexOf(param) === -1 &&
          value !== initialState[param]
      )
    )
  ).toString();
  return `${path}?${pathSearchParams}`;
};

export default paramsSlice.reducer;
export const { setParams } = paramsSlice.actions;
// Other code such as selectors can use the imported `RootState` type
export const getParams = (state: RootState) => state.params;
