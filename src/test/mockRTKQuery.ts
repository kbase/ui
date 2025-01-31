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
 */

import {
  ApiEndpointMutation,
  ApiEndpointQuery,
} from '@reduxjs/toolkit/dist/query/core/module';
// import {
//   UseQuery,
//   UseMutation,
// } from '@reduxjs/toolkit/dist/query/react/buildHooks';
import type {
  QueryDefinition,
  MutationDefinition,
} from '@reduxjs/toolkit/query';
import { act } from '@testing-library/react';
import * as React from 'react';

/** Extracts return data type from an RTK Query or Mutation endpoint */
type EndpointData<Endpoint> = Endpoint extends ApiEndpointMutation<
  MutationDefinition<any, any, any, infer ResultType>,
  any
>
  ? ResultType
  : Endpoint extends ApiEndpointQuery<
      QueryDefinition<any, any, any, infer ResultType>,
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

/** Configuration state for mocking a query */
type MockQueryState<TData> = {
  data?: RecursivePartial<TData>;
  error?: { message: string };
  isLoading?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
};

/** Configuration state for mocking a mutation */
type MockMutationState<TData> = {
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

// /** Extracts the useQuery hook type from an RTK Query endpoint */
// type QueryHook<E> = E extends ApiEndpointQuery<infer QueryDefinition, any>
//   ? UseQuery<QueryDefinition>
//   : never;

// /** Extracts the useMutation hook type from an RTK Query endpoint */
// type MutationHook<E> = E extends ApiEndpointMutation<
//   infer MutationDefinition,
//   any
// >
//   ? UseMutation<MutationDefinition>
//   : never;

// Cache to store subscribers for each endpoint
// Allows triggering re-renders when mock data changes
const subscriberCache = new Map<string, Set<(data: any) => void>>();

/** Mocks an RTK Query endpoint for testing */
export function mockQuery<E extends ApiEndpointQuery<any, any>>(
  endpoint: E,
  state: MockQueryState<EndpointData<E>> = {}
) {
  const {
    data = undefined,
    error = undefined,
    isLoading = false,
    isError = !!error,
    isSuccess = !!data,
  } = state;

  const mockResult: QueryHookResult<EndpointData<E>> = {
    data,
    error,
    isLoading,
    isError,
    isSuccess,
    isUninitialized: false,
    isFetching: isLoading,
    refetch: jest.fn(),
    currentData: data as EndpointData<E>,
  };

  if (!subscriberCache.has(endpoint.name)) {
    subscriberCache.set(endpoint.name, new Set());
  }
  const subscribers = subscriberCache.get(endpoint.name);
  if (!subscribers) throw new Error('Subscriber cache error');

  const hookMock = jest.fn().mockImplementation(() => {
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

  jest.spyOn(endpoint, 'useQuery' as any).mockImplementation(hookMock as any);
  return hookMock;
}

/** Mocks an RTK Mutation endpoint for testing */
export function mockMutation<E extends ApiEndpointMutation<any, any>>(
  endpoint: E,
  state: MockMutationState<EndpointData<E>> = {}
) {
  const { data = undefined, error = undefined } = state;

  if (!subscriberCache.has(endpoint.name)) {
    subscriberCache.set(endpoint.name, new Set());
  }
  const subscribers = subscriberCache.get(endpoint.name);
  if (!subscribers) throw new Error('Subscriber cache error');

  const trigger = jest.fn().mockResolvedValue({ data, error });

  const hookResult: MutationHookResult<EndpointData<E>> = [
    trigger as MutationTrigger<EndpointData<E>>,
    {
      data: data as EndpointData<E>,
      error,
      isLoading: false,
      isError: !!error,
      isSuccess: !!data,
      isUninitialized: false,
      reset: jest.fn(),
    },
  ];

  const hookMock = jest.fn().mockImplementation(() => {
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

  jest
    .spyOn(endpoint, 'useMutation' as any)
    .mockImplementation(hookMock as any);
  return { mockFn: hookMock, trigger };
}
