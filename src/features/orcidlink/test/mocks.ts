import { MockResponseInit } from 'jest-fetch-mock/types';
import { JSONRPC20Error } from '../../../common/api/utils/kbaseBaseQuery';
import {
  LINK_RECORD_1,
  ORCIDLINK_IS_LINKED_AUTHORIZATION_REQUIRED,
  PROFILE_1,
  SERVICE_INFO_1,
} from './data';

export function jsonrpc20_resultResponse(id: string, result: unknown) {
  return {
    body: JSON.stringify({
      jsonrpc: '2.0',
      id,
      result,
    }),
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  };
}

export function jsonrpc20_errorResponse(id: string, error: JSONRPC20Error) {
  return {
    body: JSON.stringify({
      jsonrpc: '2.0',
      id,
      error,
    }),
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function restResponse(result: any, status = 200) {
  return {
    body: JSON.stringify(result),
    status,
    headers: {
      'content-type': 'application/json',
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockIsLinkedResponse(body: any) {
  const username = body['params']['username'];

  const result = (() => {
    switch (username) {
      case 'foo':
        return true;
      case 'bar':
        return false;
      default:
        throw new Error('Invalid test value for username');
    }
  })();
  return jsonrpc20_resultResponse(body['id'], result);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mockIsLinkedNotResponse(body: any) {
  return jsonrpc20_resultResponse(body['id'], false);
}

export function setupMockRegularUser() {
  fetchMock.mockResponse(
    async (request): Promise<MockResponseInit | string> => {
      const { pathname } = new URL(request.url);
      // put a little delay in here so that we have a better
      // chance of catching temporary conditions, like loading.
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 300);
      });
      switch (pathname) {
        // Mocks for the orcidlink api
        case '/services/orcidlink/api/v1': {
          if (request.method !== 'POST') {
            return '';
          }
          const body = await request.json();
          const id = body['id'];
          switch (body['method']) {
            case 'is-linked':
              // In this mock, user "foo" is linked, user "bar" is not.
              return jsonrpc20_resultResponse(id, mockIsLinkedResponse(body));
            case 'get-orcid-profile':
              // simulate fetching an orcid profile
              return jsonrpc20_resultResponse(id, PROFILE_1);
            case 'owner-link':
              // simulate fetching the link record for a user
              return jsonrpc20_resultResponse(id, LINK_RECORD_1);
            case 'info':
              // simulate getting service info.
              return jsonrpc20_resultResponse(id, SERVICE_INFO_1);
            default:
              return '';
          }
        }
        default:
          return '';
      }
    }
  );
}

export function setupMockRegularUserWithError() {
  fetchMock.mockResponse(
    async (request): Promise<MockResponseInit | string> => {
      const { pathname } = new URL(request.url);
      // put a little delay in here so that we have a better
      // chance of catching temporary conditions, like loading.
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 300);
      });
      switch (pathname) {
        // Mocks for the orcidlink api
        case '/services/orcidlink/api/v1': {
          if (request.method !== 'POST') {
            return '';
          }
          const body = await request.json();
          const id = body['id'] as string;
          switch (body['method']) {
            case 'is-linked':
              return jsonrpc20_errorResponse(
                id,
                ORCIDLINK_IS_LINKED_AUTHORIZATION_REQUIRED
              );
            case 'get-orcid-profile': {
              return jsonrpc20_errorResponse(
                id,
                ORCIDLINK_IS_LINKED_AUTHORIZATION_REQUIRED
              );
            }
            case 'owner-link':
              // simulate fetching the link record for a user
              return jsonrpc20_resultResponse(id, LINK_RECORD_1);

            case 'info':
              // simulate getting service info
              return jsonrpc20_resultResponse(id, SERVICE_INFO_1);

            default:
              return '';
          }
        }
        default:
          return '';
      }
    }
  );
}

/**
 * This is an empty function that serves as a placeholder for props that expect
 * one, but in tests in which these props are not tested, so they need not do anything.
 */
export function noop() {
  // do nothing
}
