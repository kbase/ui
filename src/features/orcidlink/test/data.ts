import { InfoResult } from '../../../common/api/orcidlinkAPI';
import {
  LinkRecordPublic,
  ORCIDProfile,
} from '../../../common/api/orcidLinkCommon';
import { JSONRPC20Error } from '../../../common/api/utils/kbaseBaseQuery';
import orcidlinkIsLinkedAuthorizationRequired from './data/orcidlink-is-linked-1010.json';

export const ORCIDLINK_IS_LINKED_AUTHORIZATION_REQUIRED: JSONRPC20Error =
  orcidlinkIsLinkedAuthorizationRequired;

export const PROFILE_1: ORCIDProfile = {
  orcidId: '0009-0006-1955-0944',
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
