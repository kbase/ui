import { NotificationFeed } from '../../common/api/feedsService';
import { MockParams } from 'jest-fetch-mock';

// const testProps: FeedTabsProps = {
//     userId: 'some_user',
//     isAdmin: false,
//     feeds: {
//       feed1: {
//         name: 'A feed',
//         feed: [],
//         unseen: 0,
//       },
//       user: {
//         name: 'Some User',
//         feed: [],
//         unseen: 0,
//       },
//       global: {
//         name: 'KBase',
//         feed: [],
//         unseen: 0,
//       },
//     },
//   };

function emptyFeed(name: string): NotificationFeed {
  return { name, feed: [], unseen: 0 };
}

function simpleFeedsResponseFactory(feeds: { [key: string]: string }): {
  [key: string]: NotificationFeed;
} {
  const simpleFeeds: { [key: string]: NotificationFeed } = {};
  Object.keys(feeds).forEach((feedId) => {
    simpleFeeds[feedId] = emptyFeed(feeds[feedId]);
  });
  simpleFeeds['global'] = emptyFeed('KBase');
  return simpleFeeds;
}

export const basicFeedsResponseOk = (feeds: {
  [key: string]: string;
}): [string, MockParams] => {
  const feedResponse = simpleFeedsResponseFactory(feeds);
  return [JSON.stringify(feedResponse), { status: 200 }];
};
