import { FC } from 'react';
import { NotificationFeed } from '../../common/api/feedsService';

export interface FeedTabsProps {
  userId: string;
  isAdmin: boolean;
  feeds?: {
    [key: string]: NotificationFeed;
  };
}

const FeedTabs: FC<FeedTabsProps> = ({ userId, isAdmin, feeds }) => {
  if (!feeds) {
    return <></>;
  }
  const order = getFeedsOrder(feeds);
  return (
    <>
      {order.map((feedId, idx) => {
        return <FeedTab feedId={feedId} feed={feeds[feedId]} key={idx} />;
      })}
    </>
  );
};

const FeedTab: FC<{ feedId: string; feed: NotificationFeed }> = ({
  feedId,
  feed,
}) => {
  let name = feed.name;
  if (feedId === 'global') {
    name = 'KBase Announcements';
  }
  return <div>{name}</div>;
};

function getFeedsOrder(feedsData: {
  [key: string]: NotificationFeed;
}): string[] {
  const feedOrder = Object.keys(feedsData);
  feedOrder.splice(feedOrder.indexOf('global'), 1);
  feedOrder.splice(feedOrder.indexOf('user'), 1);
  feedOrder.sort((a, b) => feedsData[a].name.localeCompare(feedsData[b].name));
  if ('user' in feedsData) {
    feedOrder.unshift('user');
  }
  if ('global' in feedsData) {
    feedOrder.unshift('global');
  }
  return feedOrder;
}

export default FeedTabs;
