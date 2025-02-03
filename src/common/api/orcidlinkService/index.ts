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
  deleteLinkingSession: { session_id: string; auth_username: string };
  deleteOwnLink: { username: string; owner_username: string };
  findLinks: { query?: SearchQuery };
  finishLinkingSession: { session_id: string; auth_username: string };
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
  deleteLinkingSession: void;
  deleteOwnLink: void;
  findLinks: { links: LinkRecordPublic[] };
  finishLinkingSession: void;
  getLink: { link: LinkRecordPublic };
  getLinkingSession: LinkRecordPublic;
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

const orcidlinkApi = baseApi
  .enhanceEndpoints({ addTagTypes: ['OrcidLink'] })
  .injectEndpoints({
    endpoints: (builder) => ({
      createLinkingSession: builder.mutation<
        orcidlinkResults['createLinkingSession'],
        orcidlinkParams['createLinkingSession']
      >({
        query: ({ username, auth_username }) =>
          orcidlinkService({
            method: 'create-linking-session',
            params: { username, auth_username },
          }),
        invalidatesTags: ['OrcidLink'],
      }),

      deleteLink: builder.mutation<
        orcidlinkResults['deleteLink'],
        orcidlinkParams['deleteLink']
      >({
        query: ({ username }) =>
          orcidlinkService({
            method: 'delete-link',
            params: { username },
          }),
        invalidatesTags: ['OrcidLink'],
      }),

      deleteLinkingSession: builder.mutation<
        orcidlinkResults['deleteLinkingSession'],
        orcidlinkParams['deleteLinkingSession']
      >({
        query: ({ session_id, auth_username }) =>
          orcidlinkService({
            method: 'delete-linking-session',
            params: { session_id, auth_username },
          }),
        invalidatesTags: ['OrcidLink'],
      }),

      deleteOwnLink: builder.mutation<
        orcidlinkResults['deleteOwnLink'],
        orcidlinkParams['deleteOwnLink']
      >({
        query: ({ username, owner_username }) =>
          orcidlinkService({
            method: 'delete-own-link',
            params: { username, owner_username },
          }),
        invalidatesTags: ['OrcidLink'],
      }),

      findLinks: builder.query<
        orcidlinkResults['findLinks'],
        orcidlinkParams['findLinks']
      >({
        query: ({ query }) =>
          orcidlinkService({
            method: 'find-links',
            params: { query },
          }),
        providesTags: ['OrcidLink'],
      }),

      finishLinkingSession: builder.mutation<
        orcidlinkResults['finishLinkingSession'],
        orcidlinkParams['finishLinkingSession']
      >({
        query: ({ session_id, auth_username }) =>
          orcidlinkService({
            method: 'finish-linking-session',
            params: { session_id, auth_username },
          }),
        invalidatesTags: ['OrcidLink'],
      }),

      getLink: builder.query<
        orcidlinkResults['getLink'],
        orcidlinkParams['getLink']
      >({
        query: ({ username }) =>
          orcidlinkService({
            method: 'get-link',
            params: { username },
          }),
        providesTags: ['OrcidLink'],
      }),

      getLinkingSession: builder.query<
        orcidlinkResults['getLinkingSession'],
        orcidlinkParams['getLinkingSession']
      >({
        query: ({ session_id, auth_username }) =>
          orcidlinkService({
            method: 'get-linking-session',
            params: { session_id, auth_username },
          }),
        providesTags: ['OrcidLink'],
      }),

      getProfile: builder.query<
        orcidlinkResults['getProfile'],
        orcidlinkParams['getProfile']
      >({
        query: ({ username, auth_username }) =>
          orcidlinkService({
            method: 'get-profile',
            params: { username, auth_username },
          }),
        providesTags: ['OrcidLink'],
      }),

      getWork: builder.query<
        orcidlinkResults['getWork'],
        orcidlinkParams['getWork']
      >({
        query: ({ username, put_code }) =>
          orcidlinkService({
            method: 'get-work',
            params: { username, put_code },
          }),
        providesTags: ['OrcidLink'],
      }),

      getWorks: builder.query<
        orcidlinkResults['getWorks'],
        orcidlinkParams['getWorks']
      >({
        query: ({ username }) =>
          orcidlinkService({
            method: 'get-works',
            params: { username },
          }),
        providesTags: ['OrcidLink'],
      }),

      isLinked: builder.query<
        orcidlinkResults['isLinked'],
        orcidlinkParams['isLinked']
      >({
        query: ({ username, auth_username }) =>
          orcidlinkService({
            method: 'is-linked',
            params: { username, auth_username },
          }),
        providesTags: ['OrcidLink'],
      }),

      otherLink: builder.query<
        orcidlinkResults['otherLink'],
        orcidlinkParams['otherLink']
      >({
        query: ({ username }) =>
          orcidlinkService({
            method: 'other-link',
            params: { username },
          }),
        providesTags: ['OrcidLink'],
      }),

      ownerLink: builder.query<
        orcidlinkResults['ownerLink'],
        orcidlinkParams['ownerLink']
      >({
        query: ({ username, owner_username }) =>
          orcidlinkService({
            method: 'owner-link',
            params: { username, owner_username },
          }),
        providesTags: ['OrcidLink'],
      }),

      createWork: builder.mutation<
        orcidlinkResults['createWork'],
        orcidlinkParams['createWork']
      >({
        query: ({ username, new_work }) =>
          orcidlinkService({
            method: 'create-work',
            params: { username, new_work },
          }),
        invalidatesTags: ['OrcidLink'],
      }),

      saveWork: builder.mutation<
        orcidlinkResults['saveWork'],
        orcidlinkParams['saveWork']
      >({
        query: ({ username, work_update }) =>
          orcidlinkService({
            method: 'save-work',
            params: { username, work_update },
          }),
        invalidatesTags: ['OrcidLink'],
      }),

      deleteWork: builder.mutation<
        orcidlinkResults['deleteWork'],
        orcidlinkParams['deleteWork']
      >({
        query: ({ username, put_code }) =>
          orcidlinkService({
            method: 'delete-work',
            params: { username, put_code },
          }),
        invalidatesTags: ['OrcidLink'],
      }),
    }),
  });

export const {
  createLinkingSession,
  deleteLink,
  deleteLinkingSession,
  deleteOwnLink,
  findLinks,
  finishLinkingSession,
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
