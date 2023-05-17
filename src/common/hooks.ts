import { QueryDefinition } from '@reduxjs/toolkit/dist/query';
import { UseQueryHookResult } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { useCallback, useEffect, useRef, useState } from 'react';
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

export const useBackoffPolling = <
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  R extends UseQueryHookResult<QueryDefinition<unknown, any, any, unknown>>
>(
  result: R,
  pollCondition: (result: R, count: number) => boolean,
  options?: { baseInterval?: number; rate?: number; skipPoll?: boolean }
) => {
  const opts = { baseInterval: 200, rate: 2, skipPoll: false, ...options };
  const [count, setCount] = useState(0);
  const shouldPollCallback = useRef<typeof pollCondition>(pollCondition);
  shouldPollCallback.current = pollCondition;

  useEffect(() => setCount((c) => c + 1), [result.startedTimeStamp]);
  const shouldPoll = useCallback(() => {
    const should = !opts.skipPoll && shouldPollCallback.current(result, count);
    if (!should) setCount(0);
    return should;
  }, [count, opts.skipPoll, result]);

  useEffect(() => {
    if (shouldPoll()) {
      const pollTime = opts.baseInterval * Math.pow(opts.rate, count);
      const now = Date.now();
      const duration = Math.max(
        0,
        pollTime - now + (result.startedTimeStamp || now)
      );
      const timeout = setTimeout(
        () => (shouldPoll() ? result.refetch() : undefined),
        duration
      );
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [opts.baseInterval, count, pollCondition, opts.rate, result, shouldPoll]);

  return result;
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
