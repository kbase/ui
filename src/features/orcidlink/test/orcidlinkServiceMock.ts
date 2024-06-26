/**
 * Mocks the orcidlink service for tests which rely upon the orcidlink service.
 *
 * Utilizes jest-fetch-mock to provide mock impelementations of orcidlink
 * service methods.
 */
import 'core-js/actual/structured-clone';
import { MockResponseInit } from 'jest-fetch-mock/types';
import {
  JSONRPC20ErrorResponseObject,
  JSONRPC20Id,
} from '../common/api/JSONRPC20';
import ORCIDLinkAPI, {
  ErrorInfo,
  LinkingSessionPublicComplete,
} from '../common/api/ORCIDLInkAPI';
import {
  ERROR_INFO_1,
  LINKING_SESSION_1,
  LINK_RECORD_1,
  LINK_RECORD_OTHER_1,
  PROFILE_1,
  SERVICE_INFO_1,
  STATUS_1,
} from './data';
import {
  APIOverrides,
  getOverride,
  jsonrpc20_errorResponse,
  jsonrpc20_response,
  jsonrpc20_resultResponse,
} from './jsonrpc20ServiceMock';

export function makeError2(
  id: JSONRPC20Id,
  error: ErrorInfo
): JSONRPC20ErrorResponseObject {
  const { code, title } = error;
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message: title,
    },
  };
}

export function makeOrcidlinkTestClient(): ORCIDLinkAPI {
  return new ORCIDLinkAPI({
    timeout: 1000,
    url: 'http://localhost/services/orcidlink/api/v1',
  });
}

export const orcidlinkErrors: Record<string, ErrorInfo> = {
  1010: {
    code: 1010,
    title: 'Authorization Required',
    description: '',
    status_code: 100,
  },
};

export function makeOrcidlinkServiceMock(overrides: APIOverrides = {}) {
  return fetchMock.mockResponse(
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
          const method = body['method'];
          const params = body['params'];
          switch (method) {
            case 'status':
              return jsonrpc20_resultResponse(id, STATUS_1);
            case 'info':
              return jsonrpc20_resultResponse(id, SERVICE_INFO_1);
            case 'error-info':
              return jsonrpc20_resultResponse(id, ERROR_INFO_1);
            case 'is-linked': {
              // In this mock, user "foo" is linked, user "bar" is not.
              // return jsonrpc20_resultResponse(id,
              // mockIsLinkedResponse(body));
              const username = params['username'] as unknown as string;

              const override = getOverride(method, username, overrides);
              if (override) {
                return jsonrpc20_response(override(body));
              }

              switch (username) {
                case 'foo':
                  return jsonrpc20_resultResponse(id, false);
                case 'bar':
                  return jsonrpc20_resultResponse(id, true);
                case 'not_json':
                  return {
                    body: 'bad',
                    status: 200,
                    headers: {
                      'content-type': 'application/json',
                    },
                  };
                default:
                  throw new Error('case not handled');
              }
            }
            case 'get-orcid-profile':
              // simulate fetching an orcid profile
              return jsonrpc20_resultResponse(id, PROFILE_1);
            case 'owner-link':
              // simulate fetching the link record for a user
              return jsonrpc20_resultResponse(id, LINK_RECORD_1);
            case 'other-link':
              // simulate fetching the link record for a user
              return jsonrpc20_resultResponse(id, LINK_RECORD_OTHER_1);

            case 'delete-own-link':
              return jsonrpc20_resultResponse(id, null);

            case 'get-linking-session': {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const sessionId = params['session_id'] as unknown as string;

              switch (sessionId) {
                case 'foo_session': {
                  const result =
                    structuredClone<LinkingSessionPublicComplete>(
                      LINKING_SESSION_1
                    );
                  result.expires_at = Date.now() + 10000;
                  return jsonrpc20_resultResponse(id, result);
                }
                case 'foo_session_expired': {
                  const result =
                    structuredClone<LinkingSessionPublicComplete>(
                      LINKING_SESSION_1
                    );
                  result.expires_at = Date.now() - 10000;
                  return jsonrpc20_resultResponse(id, result);
                }
                case 'foo_session2': {
                  return jsonrpc20_resultResponse(id, LINKING_SESSION_1);
                }
                case 'foo_session_error_1':
                  return jsonrpc20_errorResponse(id, {
                    code: 1010,
                    message: 'Authorization Required',
                  });
                case 'not_a_session':
                  return jsonrpc20_errorResponse(id, {
                    code: 1020,
                    message: 'Not Found',
                  });
                case 'bar_session':
                  return jsonrpc20_resultResponse(id, LINKING_SESSION_1);
                default:
                  throw new Error('case not handled');
              }
            }

            case 'create-linking-session': {
              // const username = getObjectParam<string>('username', params);
              const params = body['params'];
              const username = params['username'] as unknown as string;
              switch (username) {
                case 'foo':
                  return jsonrpc20_resultResponse(id, {
                    session_id: 'foo_session_id',
                  });
                default:
                  throw new Error('case not handled');
              }
            }

            case 'delete-linking-session': {
              const sessionId = params['session_id'] as unknown as string;
              const override = getOverride(method, sessionId, overrides);
              if (override) {
                return jsonrpc20_response(override(body));
              }

              switch (sessionId) {
                case 'foo_session':
                  return jsonrpc20_resultResponse(id, null);
                default:
                  throw new Error('case not handled');
              }
            }

            case 'finish-linking-session': {
              const sessionId = params['session_id'] as unknown as string;
              const override = getOverride(method, sessionId, overrides);
              if (override) {
                return jsonrpc20_response(override(body));
              }
              switch (sessionId) {
                case 'foo_session':
                  return jsonrpc20_resultResponse(id, null);
                default: {
                  throw new Error('case not handled');
                }
              }
            }

            default:
              throw new Error('case not handled');
          }
        }
        default:
          throw new Error('case not handled');
      }
    }
  );
}
