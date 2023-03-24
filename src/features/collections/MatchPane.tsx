import {
  createMatch,
  getCollectionMatchers,
  getMatch,
} from '../../common/api/collectionsApi';
import styles from './Collections.module.scss';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Select, SelectOption } from '../../common/components';
import { listObjects, listWorkspaceInfo } from '../../common/api/workspaceApi';
import { parseError } from '../../common/api/utils/parseError';
import { useAppParam, useUpdateAppParams } from '../params/hooks';
import { useBackoff } from '../../common/hooks';

export const CollectionMatchPane = ({
  collectionId,
}: {
  collectionId: string;
}) => {
  const matchId = useAppParam('match');

  return (
    <>
      <h3>Match Options</h3>
      {matchId ? <ViewMatch /> : <CreateMatch collectionId={collectionId} />}
    </>
  );
};

const ViewMatch = () => {
  const matchId = useAppParam('match');
  const updateAppParams = useUpdateAppParams();

  const matchQuery = usePollMatch(matchId);
  const match = matchQuery.data;

  const matchCount = match?.state === 'complete' ? match.matches.length : 0;
  const upaCount =
    match?.state === 'complete'
      ? match.upas.flatMap((upaList) => upaList.split(';')).length
      : 0;

  const handleClear = () => {
    updateAppParams({ match: null });
  };

  return (
    <div>
      {matchQuery.isLoading ? (
        'Loading...'
      ) : (
        <ul>
          <li>Match ID: {match?.match_id}</li>
          <li>Match Status: {match?.state}</li>
          {match?.state === 'complete' ? (
            <li>
              You input a total of <strong>{upaCount}</strong> data objects,
              matching <strong>{matchCount}</strong> collection items.
            </li>
          ) : null}
        </ul>
      )}
      <button onClick={handleClear}>Clear Match</button>
    </div>
  );
};

const MATCHER_LABELS = new Map<string, string>(
  Object.entries({
    gtdb_lineage: 'GTDB Lineage',
  })
);
const getMatcherLabel = (matcherId: string) =>
  MATCHER_LABELS.get(matcherId.toLowerCase()) ??
  `Unknown Matcher "${matcherId}"`;

const CreateMatch = ({ collectionId }: { collectionId: string }) => {
  const updateAppParams = useUpdateAppParams();
  const matchersQuery = getCollectionMatchers.useQuery(collectionId);
  const matchers = matchersQuery.data?.data;
  const [matcherSel, setMatcherSel] = useState<SelectOption | undefined>();
  const matcherSelected = matchers?.find((d) => d.id === matcherSel?.value);
  const matcherOptions: SelectOption[] = useMemo(() => {
    setMatcherSel(undefined);
    return (
      matchers?.map((matcher) => ({
        value: matcher.id,
        label: getMatcherLabel(matcher.id),
        data: matcher,
      })) || []
    );
  }, [matchers]);

  // Narrative selection
  const [narrativeSel, setNarrativeSel] = useState<SelectOption | undefined>();

  const narrativeQuery = listWorkspaceInfo.useQuery({});

  const narrativeOptions = (narrativeQuery?.data?.[0] || []).map((ws) => ({
    value: ws[0],
    label: ws[1],
    data: ws,
  }));

  const narrativeSelected = narrativeOptions.find(
    (d) => d.value === narrativeSel?.value
  )?.data;

  // DataObj selection
  const [dataObjSel, setDataObjSel] = useState<SelectOption[]>([]);

  const dataObjQuery = listObjects.useQuery({
    ids: narrativeSelected?.[0] ? [narrativeSelected?.[0]] : [],
  });

  const allTypes = [
    ...(matcherSelected?.types || []),
    ...(matcherSelected?.set_types || []),
  ];

  const dataObjOptions = (dataObjQuery?.data?.[0] || [])
    .map((objInfo) => ({
      value: `${narrativeSelected?.[0]}/${objInfo[0]}/${objInfo[4]}`,
      label: objInfo[1],
      data: objInfo,
    }))
    .filter((opt) =>
      allTypes.some((matchType) => opt.data[2].startsWith(matchType))
    );

  // Matches
  let matchErr = '';

  const [triggerCreateMatch, createMatchResult] = createMatch.useMutation();
  const handleCreate = useCallback(() => {
    triggerCreateMatch({
      collection_id: collectionId,
      matcher_id: matcherSelected?.id || '',
      upas: dataObjSel.map((d) => d.value.toString()),
      parameters: {},
    });
  }, [dataObjSel, collectionId, matcherSelected, triggerCreateMatch]);
  if (createMatchResult.isError) {
    matchErr += `Match request failed: ${
      parseError(createMatchResult.error).message
    }`;
  }

  const createdMatchId = createMatchResult.data?.match_id;
  useEffect(() => {
    if (createMatchResult.isSuccess && createdMatchId)
      updateAppParams({ match: createdMatchId });
  }, [createMatchResult.isSuccess, createdMatchId, updateAppParams]);

  return (
    <div className={styles['matching']}>
      <Select
        placeholder="Select Matcher..."
        disabled={!matchersQuery.data}
        loading={matchersQuery.isFetching}
        value={matcherSel}
        options={matcherOptions}
        onChange={(opt) => {
          setMatcherSel(opt[0]);
          setDataObjSel([]);
        }}
      />
      <Select
        placeholder="Select Narrative..."
        disabled={!matcherSelected}
        value={narrativeSel}
        options={narrativeOptions}
        loading={narrativeQuery.isFetching}
        onChange={(opt) => {
          setNarrativeSel(opt[0]);
          setDataObjSel([]);
        }}
      />
      <Select
        placeholder="Select Data Objects..."
        multiple={true}
        disabled={!narrativeSelected}
        value={dataObjSel}
        options={dataObjOptions}
        loading={dataObjQuery.isFetching}
        onChange={(opts) => setDataObjSel(opts)}
      />
      <button
        disabled={
          !(matcherSelected && narrativeSelected && dataObjSel.length > 0)
        }
        onClick={handleCreate}
      >
        Create Match
      </button>
      <br></br>
      <code>{matchErr}</code>
    </div>
  );
};

const usePollMatch = (matchId: string | undefined) => {
  const backoff = useBackoff();
  useEffect(() => {
    backoff.reset();
    backoff.toggle(!!matchId);
  }, [matchId, backoff]);

  const getMatchQuery = getMatch.useQuery(matchId || '', {
    skip: !matchId,
    pollingInterval: backoff.duration,
  });

  useEffect(
    () => backoff.increment(),
    [getMatchQuery.startedTimeStamp, backoff]
  );

  const pollDone =
    getMatchQuery.error || getMatchQuery.data?.state !== 'processing';

  useEffect(() => {
    backoff.toggle(!pollDone);
  }, [backoff, pollDone]);

  return getMatchQuery;
};
