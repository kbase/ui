import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../common/hooks';
import { ParamsState, generatePathWithSearchParams } from './paramsSlice';

export const useUpdateAppParams = () => {
  const params = useAppSelector((state) => state.params);
  const loc = useLocation();
  const navigate = useNavigate();
  return useCallback(
    (updates: Partial<ParamsState>) => {
      const newParams = { ...params };
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          delete newParams[key];
        } else {
          newParams[key] = value;
        }
      });
      const path = generatePathWithSearchParams(loc.pathname, {
        ...newParams,
      });
      navigate(path);
    },
    [loc.pathname, navigate, params]
  );
};

export const useAppParam = <Key extends keyof ParamsState>(key: Key) => {
  const val = useAppSelector((state) => state.params[key]);
  if (val === undefined || val === null) return undefined;
  return val as NonNullable<ParamsState[Key]>;
};
