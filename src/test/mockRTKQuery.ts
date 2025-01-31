/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Utilities for mocking RTK Query hooks in tests.
 *
 * Example usage:
 * ```ts
 * // Mock a query hook with data
 * mockQuery(api.endpoints.getUsers, {
 *   data: [{ id: 1, name: 'John' }]
 * });
 *
 * // Mock a query hook with loading state
 * mockQuery(api.endpoints.getUsers, {
 *   isLoading: true
 * });
 *
 * // Mock a query hook with error
 * mockQuery(api.endpoints.getUsers, {
 *   error: { message: 'Failed to fetch' }
 * });
 *
 * // Mock a mutation hook
 * const { trigger } = mockMutation(api.endpoints.createUser, {
 *   data: { id: 1, name: 'John' }
 * });
 *
 * // Trigger the mocked mutation
 * await trigger({ name: 'John' });
 * ```
 */

import {
  ApiEndpointMutation,
  ApiEndpointQuery,
} from '@reduxjs/toolkit/dist/query/core/module';
import type {
  QueryDefinition,
  MutationDefinition,
} from '@reduxjs/toolkit/query';
import { act } from '@testing-library/react';
import * as React from 'react';

/** Extracts return type from an RTK Query endpoint */
type ExtractQueryData<Endpoint> = Endpoint extends ApiEndpointQuery<
  QueryDefinition<any, any, any, infer ResultType>,
  any
>
  ? ResultType
  : never;

/** Extracts return type from an RTK Mutation endpoint */
type ExtractMutationData<Endpoint> = Endpoint extends ApiEndpointMutation<
  MutationDefinition<any, any, any, infer ResultType>,
  any
>
  ? ResultType
  : never;

/** Makes all properties of a type optional recursively */
type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object | undefined
    ? RecursivePartial<T[P]>
    : T[P];
};

/** Structure of a React-Query hook result */
type QueryHookResult<TData> = {
  data?: RecursivePartial<TData>;
  error?: { message: string };
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isUninitialized: boolean;
  isFetching: boolean;
  refetch: () => void;
  currentData?: TData;
};

/** Configuration options for mocking a query */
type MockQueryOptions<TData> = {
  data?: RecursivePartial<TData>;
  error?: { message: string };
  isLoading?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
};

/** Configuration options for mocking a mutation */
type MockMutationOptions<TData> = {
  data?: RecursivePartial<TData>;
  error?: { message: string };
};

/** Function returned by useMutation */
type MutationTrigger<TData> = (...args: any) => Promise<{
  data?: TData;
  error?: { message: string };
}>;

/** Complete return value of a useMutation hook */
type MutationHookResult<TData> = [
  MutationTrigger<TData>,
  {
    data?: TData;
    error?: { message: string };
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    isUninitialized: boolean;
    reset: () => void;
  }
];

// Cache to store subscribers for each endpoint
// Allows triggering re-renders when mock data changes
const subscriberCache = new Map<
  ApiEndpointQuery<any, any> | ApiEndpointMutation<any, any>,
  Set<(data: any) => void>
>();

/** Mocks an RTK Query endpoint for testing */
export function mockQuery<E extends ApiEndpointQuery<any, any>>(
  endpoint: E,
  options: MockQueryOptions<ExtractQueryData<E>> = {}
) {
  type DataType = ExtractQueryData<E>;
  const {
    data = undefined,
    error = undefined,
    isLoading = false,
    isError = !!error,
    isSuccess = !!data,
  } = options;

  const mockResult: QueryHookResult<DataType> = {
    data,
    error,
    isLoading,
    isError,
    isSuccess,
    isUninitialized: false,
    isFetching: isLoading,
    refetch: jest.fn(),
    currentData: data as DataType,
  };

  if (!subscriberCache.has(endpoint)) {
    subscriberCache.set(endpoint, new Set());
  }
  const subscribers = subscriberCache.get(endpoint);
  if (!subscribers) throw new Error('Subscriber cache error');

  const mockFn = jest.fn().mockImplementation(() => {
    const [result, setResult] = React.useState(mockResult);

    React.useEffect(() => {
      const forceUpdate = (newData: typeof mockResult) => {
        setResult(newData);
      };

      subscribers.add(forceUpdate);
      return () => {
        subscribers.delete(forceUpdate);
      };
    }, []);

    return result;
  });

  if (subscribers.size > 0) {
    act(() => {
      subscribers.forEach((subscriber) => subscriber(mockResult));
    });
  }

  jest.spyOn(endpoint, 'useQuery' as any).mockImplementation(mockFn as any);
  return mockFn;
}

/** Mocks an RTK Mutation endpoint for testing */
export function mockMutation<E extends ApiEndpointMutation<any, any>>(
  endpoint: E,
  options: MockMutationOptions<ExtractMutationData<E>> = {}
) {
  type DataType = ExtractQueryData<E>;
  const { data = undefined, error = undefined } = options;

  if (!subscriberCache.has(endpoint)) {
    subscriberCache.set(endpoint, new Set());
  }
  const subscribers = subscriberCache.get(endpoint);
  if (!subscribers) throw new Error('Subscriber cache error');

  const trigger = jest.fn().mockResolvedValue({ data, error });

  const hookResult: MutationHookResult<DataType> = [
    trigger as MutationTrigger<DataType>,
    {
      data: data as DataType,
      error,
      isLoading: false,
      isError: !!error,
      isSuccess: !!data,
      isUninitialized: false,
      reset: jest.fn(),
    },
  ];

  const mockFn = jest.fn().mockImplementation(() => {
    const [result, setResult] = React.useState(hookResult);

    React.useEffect(() => {
      const forceUpdate = (newData: typeof hookResult) => {
        setResult(newData);
      };

      subscribers.add(forceUpdate);
      return () => {
        subscribers.delete(forceUpdate);
      };
    }, []);

    return result;
  });

  if (subscribers.size > 0) {
    act(() => {
      subscribers.forEach((subscriber) => subscriber(hookResult));
    });
  }

  jest.spyOn(endpoint, 'useMutation' as any).mockImplementation(mockFn as any);
  return { mockFn, trigger };
}
