import { NotificationFeed } from '../../common/api/feedsService';
import { MockParams } from 'jest-fetch-mock';

function emptyFeed(name: string): NotificationFeed {
  return { name, feed: [], unseen: 0 };
}

function simpleFeedsResponseFactory(feeds: { [key: string]: string }): {
  [key: string]: NotificationFeed;
} {
  const simpleFeeds = Object.keys(feeds).reduce(
    (acc: { [key: string]: NotificationFeed }, feedId) => {
      acc[feedId] = emptyFeed(feeds[feedId]);
      return acc;
    },
    {}
  );
  return simpleFeeds;
}

export const basicFeedsResponseOk = (feeds: {
  [key: string]: string;
}): [string, MockParams] => {
  return [JSON.stringify(simpleFeedsResponseFactory(feeds)), { status: 200 }];
};
