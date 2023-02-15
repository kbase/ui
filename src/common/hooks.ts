import { useEffect } from 'react';
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
