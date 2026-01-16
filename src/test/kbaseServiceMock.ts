/**
 * A testing http server for simulating KBase service endpoints.
 *
 * When testing components, apis, or other elements of Europa which depend upon contacting
 * external resources via http, the recommended approach is to avoid mocking
 * local code like api clients, but rather to provide an actual api endpoint.
 *
 * This implementation uses the "mirage" library, which intercepts fetch
 * requests.
 *
 * One implication of this is that ALL fetch requests will be run against the
 * mock server. Any tests which inadvertently rely upon contacting CI services
 * will fail unless support is added herein.
 *
 * Note too that the host origin is 'http://localhost'. See
 * `src/common/api/index.ts` which defines baseUrl for the test environment.
 */
import type { MockResponse } from 'vitest-fetch-mock';
import {
  STATUS_1,
  VIEW_ASSEMBLY_BRIEF_INFO_1,
} from './data/narrative_method_store';
import { KBASEUITEST_PROFILE } from './data/user_profile';
import { jsonrpc11_resultResponse } from './jsonrpc11';

type MockResponseInit = MockResponse;

/**
 * Creates response for fetch mock supplied by jest-fetch-mock.
 *
 * Most data used for responses is located in the "data" directory.
 *
 */
export function makeKBaseServices() {
  return fetchMock.mockResponse(
    async (request: Request): Promise<MockResponseInit | string> => {
      const { pathname } = new URL(request.url);
      // put a little delay in here so that we have a better
      // chance of catching temporary conditions, like loading.
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(null);
        }, 300);
      });
      switch (pathname) {
        case '/services/user_profile/rpc': {
          if (request.method !== 'POST') {
            return '';
          }
          const body = await request.json();
          const id = body['id'];
          const method = body['method'];
          const params = body['params'];
          switch (method) {
            case 'UserProfile.get_user_profile': {
              const users = params[0];
              if (users.length === 0) {
                return jsonrpc11_resultResponse(id, [[]]);
              }
              switch (users[0]) {
                case 'not_a_user':
                  // When a user profile is not found;
                  return jsonrpc11_resultResponse(id, [[null]]);
                case 'kbaseuitest':
                  return jsonrpc11_resultResponse(id, [[KBASEUITEST_PROFILE]]);
                default:
                  throw new Error('case not handled');
              }
            }

            default:
              throw new Error('case not handled');
          }
        }
        case '/services/narrative_method_store': {
          if (request.method !== 'POST') {
            return '';
          }
          const body = await request.json();
          const id = body['id'];
          const method = body['method'];
          const params = body['params'];
          switch (method) {
            case 'NarrativeMethodStore.get_method_brief_info': {
              const ids = params['ids'];

              switch (ids[0]) {
                case 'SomeModule.someApp':
                  return jsonrpc11_resultResponse(id, [
                    [VIEW_ASSEMBLY_BRIEF_INFO_1],
                  ]);
                default:
                  throw new Error('case not handled');
              }
            }
            case 'NarrativeMethodStore.status': {
              return jsonrpc11_resultResponse(id, [[STATUS_1]]);
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
