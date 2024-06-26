/**
 * Contains test data used in orcidlink tests.
 *
 * Most test data should reside here.
 */

import { InfoResult } from '../../../common/api/orcidlinkAPI';
import {
  LinkRecordPublic,
  LinkRecordPublicNonOwner,
  ORCIDProfile,
} from '../../../common/api/orcidLinkCommon';
import { JSONRPC20Error } from '../../../common/api/utils/kbaseBaseQuery';
import {
  ErrorInfoResult,
  LinkingSessionPublicComplete,
  StatusResult,
} from '../common/api/ORCIDLInkAPI';

// We can have a short default timeout, as tests should be running against a
// local server with very low latency.
//
// Of course if you are testing timeout errors, you should ignore this and use
// whatever values are required to trigger whatever conditions are needed.
export const API_CALL_TIMEOUT = 1000;

export const STATUS_1: StatusResult = {
  status: 'ok',
  current_time: 123,
  start_time: 456,
};

export const ERROR_INFO_1: ErrorInfoResult = {
  error_info: {
    code: 123,
    title: 'Foo Error',
    description: 'This is the foo error',
    status_code: 400,
  },
};

export const ORCIDLINK_IS_LINKED_AUTHORIZATION_REQUIRED: JSONRPC20Error = {
  code: 1010,
  message: 'Authorization Required',
  data: 'Authorization Required',
};

export const PROFILE_1: ORCIDProfile = {
  orcidId: 'foo_orcid_id',
  nameGroup: {
    private: false,
    fields: {
      firstName: 'Foo',
      lastName: 'Bar',
      creditName: 'Foo B. Bar',
    },
  },
  biographyGroup: {
    private: true,
    fields: null,
  },
  emailGroup: {
    private: false,
    fields: {
      emailAddresses: [],
    },
  },
  employment: [
    {
      name: 'LBNL',
      role: 'fictional test character',
      startYear: '2014',
      endYear: null,
    },
  ],
};

export const LINKING_SESSION_1: LinkingSessionPublicComplete = {
  session_id: 'f85a9b43-5dd4-4e1d-ad66-9f923fde5de2',
  username: 'kbaseuitest',
  created_at: 1718044771667,
  expires_at: 1718045371667,
  return_link: null,
  skip_prompt: false,
  ui_options: '',
  orcid_auth: {
    name: 'Erik T. Pearson',
    scope: '/read-limited /activities/update',
    expires_in: 631138518,
    orcid: '0009-0008-7728-946X',
  },
};

export const LINK_RECORD_1: LinkRecordPublic = {
  username: 'foo',
  created_at: 1714546800000,
  expires_at: 2345698800000,
  retires_at: 1715670000000,
  orcid_auth: {
    expires_in: 123,
    name: 'foo bar',
    orcid: 'abc123',
    scope: '/read-limited',
  },
};

export const LINK_RECORD_OTHER_1: LinkRecordPublicNonOwner = {
  username: 'bar',
  orcid_auth: {
    name: 'Bar',
    orcid: 'bar_orcid_id',
  },
};

export const SERVICE_INFO_1: InfoResult = {
  'git-info': {
    author_name: 'foo',
    branch: 'bar',
    commit_hash: 'abc',
    commit_hash_abbreviated: 'def',
    committer_date: 123,
    committer_name: 'baz',
    tag: null,
    url: 'fuzz',
  },
  'service-description': {
    name: 'orcidlink',
    description: 'the orcidlink service',
    language: 'typescript',
    repoURL: 'https://github.com/kbase/orcidlink',
    title: 'ORCID Link Service',
    version: '1.2.3',
  },
  runtime_info: {
    current_time: 123,
    orcid_api_url: 'aaa',
    orcid_oauth_url: 'bbb',
    orcid_site_url: 'ccc',
  },
};

export const INITIAL_STORE_STATE = {
  auth: {
    token: 'foo_token',
    username: 'foo',
    tokenInfo: {
      created: 123,
      expires: 456,
      id: 'abc123',
      name: 'Foo Bar',
      type: 'Login',
      user: 'foo',
      cachefor: 890,
    },
    initialized: true,
  },
};

export const INITIAL_STORE_STATE_UNAUTHENTICATED = {
  auth: {
    token: undefined,
    username: undefined,
    tokenInfo: undefined,
    initialized: false,
  },
};

export const INITIAL_STORE_STATE_BAR = {
  auth: {
    token: 'bar_token',
    username: 'bar',
    tokenInfo: {
      created: 123,
      expires: 456,
      id: 'abc123',
      name: 'Bar Baz',
      type: 'Login',
      user: 'bar',
      cachefor: 890,
    },
    initialized: true,
  },
};

export const INITIAL_UNAUTHENTICATED_STORE_STATE = {
  auth: {
    initialized: true,
  },
};
