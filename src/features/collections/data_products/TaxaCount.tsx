import { FC, Fragment, useMemo, useState } from 'react';
import {
  getTaxaCountRank,
  listTaxaCountRanks,
} from '../../../common/api/collectionsApi';
import { Loader } from '../../../common/components/Loader';
import { Select, SelectOption } from '../../../common/components/Select';
import { useBackoffPolling } from '../../../common/hooks';
import { snakeCaseToHumanReadable } from '../../../common/utils/stringUtils';
import { useMatchId, useSelectionId } from '../collectionsSlice';
import classes from './TaxaCount.module.scss';
import { Paper, PaperProps, Stack } from '@mui/material';
import { useFilterContexts } from '../Filters';

export const TaxaCount: FC<{
  collection_id: string;
  paperProps?: PaperProps;
}> = ({ collection_id, paperProps }) => {
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
    setRank(opts?.[opts.length - 1]);
    return opts;
  }, [ranksQuery.data]);

  const matchId = useMatchId(collection_id);
  const selectionId = useSelectionId(collection_id);

  useFilterContexts(collection_id, 'none');

  const displayMatch = Boolean(matchId);
  const displaySel = Boolean(selectionId);

  // Counts
  const countsParams = useMemo(
    () => ({
      collection_id,
      rank: String(rank?.value),
      match_id: displayMatch ? matchId : undefined,
      selection_id: displaySel ? selectionId : undefined,
    }),
    [collection_id, rank?.value, displayMatch, matchId, displaySel, selectionId]
  );

  const countsQuery = getTaxaCountRank.useQuery(countsParams, {
    skip: !rank,
  });

  useBackoffPolling(countsQuery, (result) => {
    if (matchId && result?.data?.match_state === 'processing') return true;
    if (selectionId && result?.data?.selection_state === 'processing')
      return true;
    return false;
  });

  const taxa = countsQuery.data?.data || [];

  const max = taxa.reduce((max, { count }) => (max > count ? max : count), 0);

  return (
    <Paper variant="outlined" {...paperProps}>
      <Stack spacing={1}>
        <div className={classes['chart-toolbar']}>
          <Select
            value={rank}
            loading={ranksQuery.isFetching}
            options={rankOptions}
            onChange={(opt) => setRank(opt[0])}
          />
        </div>
        {countsQuery.isFetching ? (
          <Loader />
        ) : (
          <div className={classes['figure']}>
            <div className={classes['name-section']}>
              {taxa.map(({ name }) => (
                <Fragment key={name}>
                  <div className={classes['name']}>{name}</div>
                  {displayMatch ? (
                    <div className={classes['sub-name']}>Matched</div>
                  ) : (
                    <></>
                  )}
                  {displaySel ? (
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
                const selWidth =
                  Math.round(((sel_count || 0) / max) * 10000) / 100;
                return (
                  <Fragment key={name}>
                    <Bar width={width} count={count} />
                    {displayMatch ? (
                      <Bar
                        className={classes['matched']}
                        width={matchWidth}
                        count={match_count || 0}
                      />
                    ) : (
                      <></>
                    )}
                    {displaySel ? (
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
        )}
      </Stack>
    </Paper>
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
