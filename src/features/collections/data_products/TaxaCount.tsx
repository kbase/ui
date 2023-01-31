import { FC, useMemo, useState } from 'react';
import {
  getTaxaCountRank,
  listTaxaCountRanks,
} from '../../../common/api/collectionsApi';
import { Select, SelectOption } from '../../../common/components/Select';
import { snakeCaseToHumanReadable } from '../../../common/utils/stringUtils';
import classes from './TaxaCount.module.scss';

export const TaxaCount: FC<{
  collection_id: string;
}> = ({ collection_id }) => {
  // Ranks
  const ranksParams = useMemo(() => ({ collection_id }), [collection_id]);
  const ranksQuery = listTaxaCountRanks.useQuery(ranksParams);
  const [rank, setRank] = useState<SelectOption>();
  const rankOptions: SelectOption[] = useMemo(() => {
    const opts =
      ranksQuery.data?.data.map((rank) => ({
        value: rank,
        label: snakeCaseToHumanReadable(rank),
      })) || [];
    setRank(opts?.[0]);
    return opts;
  }, [ranksQuery.data]);

  // Counts
  const countsParams = useMemo(
    () => ({ collection_id, rank: String(rank?.value) }),
    [collection_id, rank?.value]
  );
  const countsQuery = getTaxaCountRank.useQuery(countsParams, { skip: !rank });
  const counts = countsQuery.data?.data || [];
  const max = counts.reduce((max, { count }) => (max > count ? max : count), 0);

  if (ranksQuery.isLoading || countsQuery.isLoading) return <>Loading...</>;

  return (
    <>
      <Select
        value={rank}
        options={rankOptions}
        onChange={(opt) => setRank(opt[0])}
      />
      <br></br>
      <div className={classes['figure']}>
        <div className={classes['name-section']}>
          {counts.map(({ name }) => (
            <div className={classes['name']}>{name}</div>
          ))}
        </div>
        <div className={classes['bars-section']}>
          {counts.map(({ count }) => {
            const width = Math.round((count / max) * 10000) / 100;
            return (
              <div className={classes['bar-row']}>
                <div
                  className={classes['bar']}
                  style={{
                    width: `${width}%`,
                  }}
                >
                  {width > 50 ? (
                    <div className={classes['label-light']}>{count}</div>
                  ) : null}
                </div>
                {width < 50 ? (
                  <div className={classes['label-dark']}>{count}</div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
