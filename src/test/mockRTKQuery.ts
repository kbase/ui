/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Utilities for mocking RTK Query hooks in tests.
 *
 * Example usage:
 * ```ts
 * // Mock a query hook that returns static data
 * mockQuery(api.endpoints.getUsers, () => ({
 *   data: [{ id: 1, name: 'John' }]
 * }));
 *
 * // Mock a query hook that uses the query parameters
 * mockQuery(api.endpoints.getUser, (id: number) => ({
 *   data: { id, name: 'John' }
 * }));
 *
 * // Mock a query hook in loading state
 * mockQuery(api.endpoints.getUsers, () => ({
 *   isLoading: true
 * }));
 *
 * // Mock a query hook with error
 * mockQuery(api.endpoints.getUsers, () => ({
 *   error: { message: 'Failed to fetch' }
 * }));
 *
 * // Mock a mutation hook with success response
 * const { triggerFromTest } = mockMutation(
 *   api.endpoints.createUser,
 *   // Initial state
 *   { isLoading: false },
 *   // Callback when mutation is triggered
 *   (userData: { name: string }) => ({
 *     data: { id: 1, ...userData }
 *   })
 * );
 *
 * // Trigger the mocked mutation from a test
 * const result = await triggerFromTest({ name: 'John' });
 * // result.data = { id: 1, name: 'John' }
 *
 * // Mock a mutation hook with error response
 * const { triggerFromTest, resetFromTest } = mockMutation(
 *   api.endpoints.createUser,
 *   { isLoading: false },
 *   () => ({
 *     error: { message: 'Failed to create user' }
 *   })
 * );
 *
 * // Reset the mutation state from a test
 * resetFromTest();
 * ```
 */

import {
  ApiEndpointMutation,
  ApiEndpointQuery,
} from '@reduxjs/toolkit/dist/query/core/module';
import { UseQuery } from '@reduxjs/toolkit/dist/query/react/buildHooks';
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
  isLoading?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
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

/** Extracts the useQuery hook type from an RTK Query endpoint */
type QueryHook<E> = Exclude<
  E extends ApiEndpointQuery<infer QueryDefinition, any>
    ? UseQuery<QueryDefinition>
    : never,
  symbol
>;
type QueryHookParams<E> = [
  Exclude<Parameters<QueryHook<E>>[0], symbol>,
  ...Omit<Parameters<QueryHook<E>>, 0>
];

/** Mocks an RTK Query endpoint for testing */
export function mockQuery<E extends ApiEndpointQuery<any, any>>(
  endpoint: E,
  stateCallback: (
    ...args: QueryHookParams<E>
  ) => MockQueryState<EndpointData<E>>
) {
  const getState = (...args: QueryHookParams<E>) => {
    const {
      data = undefined,
      error = undefined,
      isLoading = false,
      isError = !!error,
      isSuccess = !!data,
    } = stateCallback(...args);

    const mockResult: QueryHookResult<EndpointData<E>> = {
      data,
      error,
      isLoading,
      isError,
      isSuccess,
      isUninitialized: false,
      isFetching: isLoading && !data,
      refetch: jest.fn(),
      currentData: data as EndpointData<E>,
    };
    return mockResult;
  };

  const hookMock = jest
    .fn()
    .mockImplementation((...args: QueryHookParams<E>) => {
      return getState(...args);
    });

  jest.spyOn(endpoint, 'useQuery' as any).mockImplementation(hookMock as any);
  return hookMock;
}

/** Mocks an RTK Mutation endpoint for testing */
export function mockMutation<E extends ApiEndpointMutation<any, any>>(
  endpoint: E,
  initialState: MockMutationState<EndpointData<E>>,
  mutateCallback: (
    ...args: Parameters<MutationTrigger<EndpointData<E>>>
  ) => MockMutationState<EndpointData<E>>
) {
  let mutateCallbackResult: MockMutationState<EndpointData<E>> | undefined =
    undefined;
  let hookUpdateResult:
    | React.Dispatch<
        React.SetStateAction<MutationHookResult<EndpointData<E>>[1]>
      >
    | undefined = undefined;

  const getState = (): MutationHookResult<EndpointData<E>>[1] => {
    const {
      data = undefined,
      error = undefined,
      isLoading = false,
      isError = !!error,
      isSuccess = !!data,
    } = mutateCallbackResult ?? initialState;

    return {
      data: data as EndpointData<E>,
      error,
      isLoading,
      isError,
      isSuccess,
      isUninitialized: !data && !error && !isLoading,
      reset: mockReset,
    };
  };

  const mockReset = jest.fn().mockImplementation(() => {
    mutateCallbackResult = undefined;
    if (hookUpdateResult) hookUpdateResult(getState());
  });

  const mockTrigger: MutationTrigger<EndpointData<E>> = async (...args) => {
    if (!mutateCallback) {
      throw new Error('No mutate callback provided');
    }

    const newState = mutateCallback(...args);
    mutateCallbackResult = newState;
    if (hookUpdateResult) hookUpdateResult(getState());

    return getState();
  };

  const trigger: MutationTrigger<EndpointData<E>> = jest
    .fn()
    .mockImplementation(mockTrigger);

  const hookMock = jest.fn().mockImplementation(() => {
    const [result, updateResult] =
      React.useState<MutationHookResult<EndpointData<E>>[1]>(getState);

    React.useEffect(() => {
      hookUpdateResult = updateResult;
      return () => {
        hookUpdateResult = undefined;
      };
    }, [updateResult]);

    return [trigger, result];
  });

  const triggerFromTest: typeof trigger = async (...args) => {
    await act(async () => {
      mockTrigger(...args);
    });
    return getState();
  };

  const resetFromTest: () => void = (...args) => {
    act(() => {
      mockReset(...args);
    });
  };

  jest
    .spyOn(endpoint, 'useMutation' as any)
    .mockImplementation(hookMock as any);
  return {
    hookMock,
    triggerMock: trigger,
    triggerFromTest,
    resetFromTest,
  };
}
