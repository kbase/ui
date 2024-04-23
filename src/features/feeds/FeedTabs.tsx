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
  return (
    <>
      {Object.keys(feeds).map((feedId, idx) => {
        return <FeedTab feedId={feedId} feed={feeds[feedId]} key={idx} />;
      })}
    </>
  );
};

const FeedTab: FC<{ feedId: string; feed: NotificationFeed }> = ({
  feedId,
  feed,
}) => {
  return <div>{feed.name}</div>;
};

export default FeedTabs;
