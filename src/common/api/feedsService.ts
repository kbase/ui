// import { store } from '../../app/store';
import { store } from '../../app/store';
import { baseApi } from './index';
import { httpService } from './utils/serviceHelpers';

const feedsService = httpService({
  url: '/services/feeds',
});

interface FeedsParams {
  getFeedsUnseenCount: void;
}

interface FeedsResults {
  getFeedsUnseenCount: {
    unseen: {
      global: number;
      user: number;
    };
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
  }),
});

export const { getFeedsUnseenCount } = feedsApi.endpoints;
