import { useCallback, useEffect, useMemo, useState } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../app/store';
import {
  generatePathWithSearchParams,
  isValidParam,
  setParams,
} from '../features/params/paramsSlice';

// Use throughout the app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useBackoff = (baseInterval = 200, rate = 2, initPoll = true) => {
  // backoff state
  const [polling, setPolling] = useState(initPoll);
  const [count, setCount] = useState(0);

  // helpers to be used within useEffects
  const reset = useCallback((count = 0) => setCount(count), []);
  const increment = useCallback(() => setCount((count) => count + 1), []);
  const toggle = useCallback(
    (pollState?: boolean) => setPolling((p) => pollState ?? !p),
    []
  );

  // Return object only changes if the callbacks do (for now they don't)
  // this lets us easily use useBackoff return value in useEffect dep arrays
  const backoff = useMemo(
    () => ({
      duration: 0,
      increment,
      toggle,
      reset,
      count: 0,
      isPolling: false,
    }),
    [increment, reset, toggle]
  );
  backoff['duration'] = polling ? baseInterval * Math.pow(rate, count) : 0;
  backoff['count'] = count;
  backoff['isPolling'] = polling;

  return backoff;
};

export const ignoredParameterWarning = (ignored: string[]) =>
  `Ignored parameters: ${ignored.join(', ')}`;

// Filter URL Search Parameters to only those recognized in paramsSlice
export const useFilteredParams = () => {
  const dispatch = useAppDispatch();
  const loc = useLocation();
  const navigate = useNavigate();
  const locSearch = new URLSearchParams(loc.search);
  const paramsIgnored = Array.from(locSearch.entries())
    .filter(([param]) => !isValidParam(param))
    .map(([param]) => {
      return param;
    });
  if (paramsIgnored.length) {
    // eslint-disable-next-line no-console
    console.log(ignoredParameterWarning(paramsIgnored));
  }
  const paramsFiltered = Object.fromEntries(
    Array.from(locSearch.entries()).filter(([param]) => isValidParam(param))
  );
  const check = Array.from(locSearch.entries())
    .map(([param, value]) => paramsFiltered[param] === value)
    .filter((entry) => !entry);
  useEffect(() => {
    if (check.length) {
      const path = generatePathWithSearchParams(loc.pathname, paramsFiltered);
      navigate(path);
    }
    dispatch(setParams(paramsFiltered));
  }, [check.length, dispatch, loc.pathname, navigate, paramsFiltered]);
  return paramsFiltered;
};
