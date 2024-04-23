// import { store } from '../../app/store';
import { store } from '../../app/store';
import { baseApi } from './index';
import { httpService } from './utils/serviceHelpers';

const feedsService = httpService({
  url: '/services/feeds/api/V1',
});

export interface NotificationEntity {
  id: string;
  type: string;
  name?: string;
}

export interface Notification {
  id: string;
  actor: NotificationEntity;
  verb: string;
  object: NotificationEntity;
  target: NotificationEntity[];
  source: string;
  level: string;
  seen: boolean;
  created: number;
  expires: number;
  externalKey: string;
  context: object;
  users: NotificationEntity[];
}

export interface NotificationFeed {
  name: string;
  unseen: number;
  feed: Notification[];
}

interface FeedsParams {
  getFeedsUnseenCount: void;
  getNotificationsParams: {
    n?: number; // the maximum number of notifications to return. Should be a number > 0.
    rev?: number; // reverse the chronological sort order if 1, if 0, returns with most recent first
    l?: string; // filter by the level. Allowed values are alert, warning, error, and request
    v?: string; // filter by verb used
    seen?: number; // return all notifications that have also been seen by the user if this is set to 1.
  };
}

interface FeedsResults {
  getFeedsUnseenCount: {
    unseen: {
      global: number;
      user: number;
    };
  };
  getNotificationsResults: {
    [key: string]: NotificationFeed;
  };
}

// Stubbed Feeds Api for sidebar notifs
export const feedsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeedsUnseenCount: builder.query<
      FeedsResults['getFeedsUnseenCount'],
      FeedsParams['getFeedsUnseenCount']
    >({
      query: () => {
        return feedsService({
          headers: {
            Authorization: store.getState().auth.token,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'GET',
          url: '/notifications/unseen_count',
        });
      },
    }),

    getFeeds: builder.query<
      FeedsResults['getNotificationsResults'],
      FeedsParams['getNotificationsParams']
    >({
      query: () => {
        return feedsService({
          headers: {
            Authorization: store.getState().auth.token,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'GET',
          url: '/notifications',
        });
      },
    }),
  }),
});

export const { getFeedsUnseenCount, getFeeds } = feedsApi.endpoints;
