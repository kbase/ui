import { FC } from 'react';

/**
 * Display overview information for a selected collection.
 * This data product should be present for every collection.
 */
export const Overview: FC<{
  collection_id: string;
}> = ({ collection_id }) => {
  return <div>Overview Placeholder for {collection_id}</div>;
};
