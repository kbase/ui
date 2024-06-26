import fetchMock from 'jest-fetch-mock';
import { FetchMock } from 'jest-fetch-mock/types';
import { ORCIDProfile } from '../../../../common/api/orcidLinkCommon';
import {
  ERROR_INFO_1,
  LINKING_SESSION_1,
  LINK_RECORD_1,
  LINK_RECORD_OTHER_1,
  PROFILE_1,
} from '../../test/data';
import { makeORCIDLinkAPI } from '../../test/mocks';
import { makeOrcidlinkServiceMock } from '../../test/orcidlinkServiceMock';
import {
  CreateLinkingSessionParams,
  CreateLinkingSessionResult,
  DeleteLinkingSessionParams,
  DeleteLinkParams,
  FinishLinkingSessionParams,
  GetLinkingSessionParams,
  GetProfileParams,
  LinkingSessionPublicComplete,
} from './ORCIDLInkAPI';

describe('The ORCIDLink API', () => {
  let mockService: FetchMock;

  beforeEach(() => {
    fetchMock.enableMocks();
    fetchMock.doMock();
    mockService = makeOrcidlinkServiceMock();
  });

  afterEach(() => {
    mockService.mockClear();
    fetchMock.disableMocks();
  });

  it('correctly calls the "status" method', async () => {
    const api = makeORCIDLinkAPI();

    const result = await api.status();

    expect(result.status).toBe('ok');
  });

  it('correctly calls the "info" method', async () => {
    const api = makeORCIDLinkAPI();

    const result = await api.info();

    expect(result['git-info'].author_name).toBe('foo');
  });

  it('correctly calls the "error-info" method', async () => {
    const api = makeORCIDLinkAPI();

    const testCases = [
      {
        params: {
          errorCode: 123,
        },
        expected: ERROR_INFO_1,
      },
    ];

    for (const { params, expected } of testCases) {
      const result = await api.errorInfo(params.errorCode);
      expect(result).toMatchObject(expected);
    }
  });

  it('correctly calls the "is-linked" method', async () => {
    const api = makeORCIDLinkAPI();

    const testCases = [
      {
        params: {
          username: 'foo',
        },
        expected: false,
      },
      {
        params: {
          username: 'bar',
        },
        expected: true,
      },
    ];

    for (const { params, expected } of testCases) {
      const result = await api.isLinked(params);
      expect(result).toBe(expected);
    }
  });

  it('correctly calls the "owner-link" method', async () => {
    const api = makeORCIDLinkAPI();

    const testCases = [
      {
        params: {
          username: 'foo',
        },
        expected: LINK_RECORD_1,
      },
    ];

    for (const { params, expected } of testCases) {
      const result = await api.getOwnerLink(params);
      expect(result).toMatchObject(expected);
    }
  });

  it('correctly calls the "other-link" method', async () => {
    const api = makeORCIDLinkAPI();

    const testCases = [
      {
        params: {
          username: 'bar',
        },
        expected: LINK_RECORD_OTHER_1,
      },
    ];

    for (const { params, expected } of testCases) {
      const result = await api.getOtherLink(params);
      expect(result).toMatchObject(expected);
    }
  });

  it('correctly calls the "delete-own-link" method', async () => {
    const api = makeORCIDLinkAPI();

    const testCases: Array<{ params: DeleteLinkParams }> = [
      {
        params: {
          username: 'bar',
        },
      },
    ];

    for (const { params } of testCases) {
      const result = await api.deleteOwnLink(params);
      expect(result).toBeUndefined();
    }
  });

  it('correctly calls the "create-linking-session" method', async () => {
    const api = makeORCIDLinkAPI();

    const testCases: Array<{
      params: CreateLinkingSessionParams;
      expected: CreateLinkingSessionResult;
    }> = [
      {
        params: {
          username: 'foo',
        },
        expected: {
          session_id: 'foo_session_id',
        },
      },
    ];

    for (const { params, expected } of testCases) {
      const result = await api.createLinkingSession(params);
      expect(result).toMatchObject(expected);
    }
  });

  it('correctly calls the "get-linking-session" method', async () => {
    const api = makeORCIDLinkAPI();

    const testCases: Array<{
      params: GetLinkingSessionParams;
      expected: LinkingSessionPublicComplete;
    }> = [
      {
        params: {
          session_id: 'foo_session2',
        },
        expected: LINKING_SESSION_1,
      },
    ];

    for (const { params, expected } of testCases) {
      const result = await api.getLinkingSession(params);
      expect(result).toMatchObject(expected);
    }
  });

  it('correctly calls the "delete-linking-session" method', async () => {
    const api = makeORCIDLinkAPI();

    const testCases: Array<{
      params: DeleteLinkingSessionParams;
    }> = [
      {
        params: {
          session_id: 'foo_session',
        },
      },
    ];

    for (const { params } of testCases) {
      const result = await api.deleteLinkingSession(params);
      expect(result).toBeUndefined();
    }
  });

  it('correctly calls the "finish-linking-session" method', async () => {
    const api = makeORCIDLinkAPI();

    const testCases: Array<{
      params: FinishLinkingSessionParams;
    }> = [
      {
        params: {
          session_id: 'foo_session',
        },
      },
    ];

    for (const { params } of testCases) {
      const result = await api.finishLinkingSession(params);
      expect(result).toBeUndefined();
    }
  });

  it('correctly calls the "get-orcid-profile" method', async () => {
    const api = makeORCIDLinkAPI();

    const testCases: Array<{
      params: GetProfileParams;
      expected: ORCIDProfile;
    }> = [
      {
        params: {
          username: 'foo',
        },
        expected: PROFILE_1,
      },
    ];

    for (const { params, expected } of testCases) {
      const result = await api.getProfile(params);
      expect(result).toMatchObject(expected);
    }
  });
});
