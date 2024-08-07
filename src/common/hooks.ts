import { QueryDefinition } from '@reduxjs/toolkit/dist/query';
import { UseQueryHookResult } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../app/store';
import { authMe } from '../features/auth/authSlice';
import {
  generatePathWithSearchParams,
  isValidParam,
  setParams,
} from '../features/params/paramsSlice';

declare global {
  interface Window {
    gtag: Function;
  }
}
// Use throughout the app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const pollLock: Set<string> = new Set();
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
  const pollLockStatus = useRef<boolean>(false);
  const shouldPollCallback = useRef<typeof pollCondition>(pollCondition);
  shouldPollCallback.current = pollCondition;

  // Prevents us from polling the identical request from multiple components
  useEffect(() => {
    const lockId = result.requestId;
    if (lockId && !pollLock.has(lockId)) {
      pollLock.add(lockId);
      pollLockStatus.current = true;
    } else {
      pollLockStatus.current = false;
    }
    return () => {
      if (lockId && pollLock.has(lockId)) {
        pollLock.delete(lockId);
        pollLockStatus.current = false;
      }
    };
  }, [result.requestId]);

  useEffect(() => setCount((c) => c + 1), [result.fulfilledTimeStamp]);
  const shouldPoll = useCallback(() => {
    const should =
      !opts.skipPoll &&
      pollLockStatus.current &&
      shouldPollCallback.current(result, count);
    if (!should) setCount(0);
    return should;
  }, [count, opts.skipPoll, result]);

  useEffect(() => {
    if (!result.isUninitialized && shouldPoll()) {
      const pollTime = opts.baseInterval * Math.pow(opts.rate, count);
      const now = Date.now();
      const duration = Math.max(
        0,
        pollTime - now + (result.fulfilledTimeStamp || now)
      );
      const timeout = setTimeout(
        () => (shouldPoll() ? result.refetch() : undefined),
        duration
      );
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [
    opts.baseInterval,
    count,
    pollCondition,
    opts.rate,
    result,
    shouldPoll,
    result.isUninitialized,
  ]);

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

export const usePageTracking = () => {
  const location = useLocation();
  const me = useAppSelector(authMe);

  useEffect(() => {
    const pageView: Record<string, string> = {
      page_path: location.pathname + location.search + location.hash,
      page_search: location.search,
      page_hash: location.hash,
    };
    if (me && me.anonid) {
      pageView.user_id = me.anonid;
    }
    window.gtag('event', 'page_view', pageView);
  }, [location, me]);
};

/**
 * Callback debouncer which returns a function that accepts a delay and returns a debounced callback.
 * This is useful when multiple callback delays are desired, such that they share a single timeout state.
 * e.g. debounced(0)('foo') will clear the timeout for debounced(600)('blah') and the cb will be called with 'foo'
 */
export const useDebounce = <T extends (...args: Parameters<T>) => void>(
  cb: T
) => {
  const timeout = useRef<number>();
  return (delay: number) =>
    (...args: Parameters<T>) => {
      clearTimeout(timeout.current);
      timeout.current = window.setTimeout(() => cb(...args), delay);
    };
};
