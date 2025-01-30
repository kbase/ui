import { baseApi } from './../index';
import { jsonRpcService } from './../utils/serviceHelpers';
import {
  LinkRecordPublic,
  LinkRecordPublicNonOwner,
  ORCIDProfile,
  Work,
  NewWork,
  WorkUpdate,
  ORCIDWorkGroup,
  SearchQuery,
} from './types';

const orcidlinkService = jsonRpcService({
  url: '/services/orcidlink/api/v1',
  version: '2.0',
});

interface orcidlinkParams {
  createLinkingSession: { username: string; auth_username: string };
  deleteLink: { username: string };
  deleteOwnLink: { username: string; owner_username: string };
  findLinks: { query?: SearchQuery };
  getLink: { username: string };
  getLinkingSession: { session_id: string; auth_username: string };
  getProfile: { username: string; auth_username: string };
  getWork: { username: string; put_code: number };
  getWorks: { username: string };
  isLinked: { username: string; auth_username: string };
  otherLink: { username: string };
  ownerLink: { username: string; owner_username: string };
  createWork: { username: string; new_work: NewWork };
  saveWork: { username: string; work_update: WorkUpdate };
  deleteWork: { username: string; put_code: number };
}

interface orcidlinkResults {
  createLinkingSession: { session_id: string };
  deleteLink: void;
  deleteOwnLink: void;
  findLinks: { links: LinkRecordPublic[] };
  getLink: { link: LinkRecordPublic };
  getLinkingSession: { session: LinkRecordPublic };
  getProfile: ORCIDProfile;
  getWork: { work: Work };
  getWorks: ORCIDWorkGroup[];
  isLinked: boolean;
  otherLink: LinkRecordPublicNonOwner;
  ownerLink: LinkRecordPublic;
  createWork: { work: Work };
  saveWork: { work: Work };
  deleteWork: void;
}

const orcidlinkApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createLinkingSession: builder.mutation<
      orcidlinkResults['createLinkingSession'],
      orcidlinkParams['createLinkingSession']
    >({
      query: ({ username, auth_username }) =>
        orcidlinkService({
          method: 'create_linking_session',
          params: [username, auth_username],
        }),
    }),

    deleteLink: builder.mutation<
      orcidlinkResults['deleteLink'],
      orcidlinkParams['deleteLink']
    >({
      query: ({ username }) =>
        orcidlinkService({
          method: 'delete_link',
          params: [username],
        }),
    }),

    deleteOwnLink: builder.mutation<
      orcidlinkResults['deleteOwnLink'],
      orcidlinkParams['deleteOwnLink']
    >({
      query: ({ username, owner_username }) =>
        orcidlinkService({
          method: 'delete_own_link',
          params: [username, owner_username],
        }),
    }),

    findLinks: builder.query<
      orcidlinkResults['findLinks'],
      orcidlinkParams['findLinks']
    >({
      query: ({ query }) =>
        orcidlinkService({
          method: 'find_links',
          params: [query],
        }),
    }),

    getLink: builder.query<
      orcidlinkResults['getLink'],
      orcidlinkParams['getLink']
    >({
      query: ({ username }) =>
        orcidlinkService({
          method: 'get_link',
          params: [username],
        }),
    }),

    getLinkingSession: builder.query<
      orcidlinkResults['getLinkingSession'],
      orcidlinkParams['getLinkingSession']
    >({
      query: ({ session_id, auth_username }) =>
        orcidlinkService({
          method: 'get_linking_session',
          params: [session_id, auth_username],
        }),
    }),

    getProfile: builder.query<
      orcidlinkResults['getProfile'],
      orcidlinkParams['getProfile']
    >({
      query: ({ username, auth_username }) =>
        orcidlinkService({
          method: 'get_profile',
          params: [username, auth_username],
        }),
    }),

    getWork: builder.query<
      orcidlinkResults['getWork'],
      orcidlinkParams['getWork']
    >({
      query: ({ username, put_code }) =>
        orcidlinkService({
          method: 'get_work',
          params: [username, put_code],
        }),
    }),

    getWorks: builder.query<
      orcidlinkResults['getWorks'],
      orcidlinkParams['getWorks']
    >({
      query: ({ username }) =>
        orcidlinkService({
          method: 'get_works',
          params: [username],
        }),
    }),

    isLinked: builder.query<
      orcidlinkResults['isLinked'],
      orcidlinkParams['isLinked']
    >({
      query: ({ username, auth_username }) =>
        orcidlinkService({
          method: 'is_linked',
          params: [username, auth_username],
        }),
    }),

    otherLink: builder.query<
      orcidlinkResults['otherLink'],
      orcidlinkParams['otherLink']
    >({
      query: ({ username }) =>
        orcidlinkService({
          method: 'other_link',
          params: [username],
        }),
    }),

    ownerLink: builder.query<
      orcidlinkResults['ownerLink'],
      orcidlinkParams['ownerLink']
    >({
      query: ({ username, owner_username }) =>
        orcidlinkService({
          method: 'owner_link',
          params: [username, owner_username],
        }),
    }),

    createWork: builder.mutation<
      orcidlinkResults['createWork'],
      orcidlinkParams['createWork']
    >({
      query: ({ username, new_work }) =>
        orcidlinkService({
          method: 'create_work',
          params: [username, new_work],
        }),
    }),

    saveWork: builder.mutation<
      orcidlinkResults['saveWork'],
      orcidlinkParams['saveWork']
    >({
      query: ({ username, work_update }) =>
        orcidlinkService({
          method: 'save_work',
          params: [username, work_update],
        }),
    }),

    deleteWork: builder.mutation<
      orcidlinkResults['deleteWork'],
      orcidlinkParams['deleteWork']
    >({
      query: ({ username, put_code }) =>
        orcidlinkService({
          method: 'delete_work',
          params: [username, put_code],
        }),
    }),
  }),
});

export const {
  createLinkingSession,
  deleteLink,
  deleteOwnLink,
  findLinks,
  getLink,
  getLinkingSession,
  getProfile,
  getWork,
  getWorks,
  isLinked,
  otherLink,
  ownerLink,
  createWork,
  saveWork,
  deleteWork,
} = orcidlinkApi.endpoints;
