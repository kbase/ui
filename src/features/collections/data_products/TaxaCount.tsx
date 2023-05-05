import { FC, Fragment, useEffect, useMemo, useState } from 'react';
import {
  getTaxaCountRank,
  listTaxaCountRanks,
} from '../../../common/api/collectionsApi';
import { Select, SelectOption } from '../../../common/components/Select';
import { useBackoff } from '../../../common/hooks';
import { snakeCaseToHumanReadable } from '../../../common/utils/stringUtils';
import { useAppParam } from '../../params/hooks';
import { useSelectionId } from '../collectionsSlice';
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
  const selectionId = useSelectionId(collection_id);
  const countsParams = useMemo(
    () => ({
      collection_id,
      rank: String(rank?.value),
      match_id: matchId,
      selection_id: selectionId,
    }),
    [collection_id, matchId, rank?.value, selectionId]
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

  useEffect(() => {
    const pollDone =
      countsQuery.error ||
      (countsQuery.data?.taxa_count_match_state !== 'processing' &&
        countsQuery.data?.taxa_count_selection_state !== 'processing');
    backoff.toggle(!pollDone);
  }, [backoff, countsQuery.data, countsQuery.error]);

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
                <div className={classes['sub-name']}>Matched</div>
              ) : (
                <></>
              )}
              {selectionId ? (
                <div className={classes['sub-name']}>Selected</div>
              ) : (
                <></>
              )}
            </Fragment>
          ))}
        </div>
        <div className={classes['bars-section']}>
          {taxa.map(({ name, count, match_count, sel_count }) => {
            const width = Math.round((count / max) * 10000) / 100;
            const matchWidth =
              Math.round(((match_count || 0) / max) * 10000) / 100;
            const selWidth = Math.round(((sel_count || 0) / max) * 10000) / 100;
            return (
              <Fragment key={name}>
                <Bar width={width} count={count} />
                {matchId ? (
                  <Bar
                    className={classes['matched']}
                    width={matchWidth}
                    count={match_count || 0}
                  />
                ) : (
                  <></>
                )}
                {selectionId ? (
                  <Bar
                    className={classes['selected']}
                    width={selWidth}
                    count={sel_count || 0}
                  />
                ) : (
                  <></>
                )}
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
        ) : (
          <></>
        )}
      </div>
      {width < 50 ? (
        <div className={classes['label-dark']}>{count}</div>
      ) : (
        <></>
      )}
    </div>
  );
};
