import { FC, Fragment, useEffect, useMemo, useState } from 'react';
import {
  getTaxaCountRank,
  listTaxaCountRanks,
} from '../../../common/api/collectionsApi';
import { Select, SelectOption } from '../../../common/components/Select';
import { useBackoff } from '../../../common/hooks';
import { snakeCaseToHumanReadable } from '../../../common/utils/stringUtils';
import { useAppParam } from '../../params/hooks';
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
  const matchId = useAppParam('match');
  const countsParams = useMemo(
    () => ({ collection_id, rank: String(rank?.value), match_id: matchId }),
    [collection_id, matchId, rank?.value]
  );
  const backoff = useBackoff();
  useEffect(() => {
    backoff.reset();
    backoff.toggle(!!matchId);
  }, [countsParams, matchId, backoff]);

  const countsQuery = getTaxaCountRank.useQuery(countsParams, {
    skip: !rank,
    pollingInterval: backoff.duration,
  });

  useEffect(() => backoff.increment(), [countsQuery.startedTimeStamp, backoff]);

  const pollDone =
    countsQuery.error ||
    countsQuery.data?.taxa_count_match_state !== 'processing';

  useEffect(() => {
    backoff.toggle(!pollDone);
  }, [backoff, pollDone]);

  const taxa = countsQuery.data?.data || [];

  const max = taxa.reduce((max, { count }) => (max > count ? max : count), 0);

  if (backoff.isPolling || ranksQuery.isLoading || countsQuery.isLoading)
    return <>Loading...</>;

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
          {taxa.map(({ name }) => (
            <Fragment key={name}>
              <div className={classes['name']}>{name}</div>
              {matchId ? (
                <div className={classes['subname']}>Matched</div>
              ) : undefined}
            </Fragment>
          ))}
        </div>
        <div className={classes['bars-section']}>
          {taxa.map(({ name, count, match_count }) => {
            const width = Math.round((count / max) * 10000) / 100;
            const matchWidth =
              Math.round(((match_count || 0) / max) * 10000) / 100;
            return (
              <Fragment key={name}>
                <Bar width={width} count={count} />
                {matchId ? (
                  <Bar
                    className={classes['matched']}
                    width={matchWidth}
                    count={match_count || 0}
                  />
                ) : undefined}
              </Fragment>
            );
          })}
        </div>
      </div>
    </>
  );
};

const Bar = ({
  width,
  count,
  className = '',
}: {
  width: number;
  count: number;
  className?: string;
}) => {
  return (
    <div className={`${classes['bar-row']} ${className}`}>
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
      {width < 50 ? <div className={classes['label-dark']}>{count}</div> : null}
    </div>
  );
};
