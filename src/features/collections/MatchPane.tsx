import {
  createMatch,
  getCollectionMatchers,
  getMatch,
} from '../../common/api/collectionsApi';
import classes from './Collections.module.scss';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Select, SelectOption } from '../../common/components';
import { listObjects } from '../../common/api/workspaceApi';
import { getNarratives } from '../../common/api/searchApi';
import { parseError } from '../../common/api/utils/parseError';
import { useAppParam, useUpdateAppParams } from '../params/hooks';
import {
  useAppDispatch,
  useAppSelector,
  useBackoffPolling,
} from '../../common/hooks';
import { setUserSelection } from './collectionsSlice';
import { store } from '../../app/store';
import { useParamsForNarrativeDropdown } from './hooks';

export const MatchPane = ({ collectionId }: { collectionId: string }) => {
  const matchId = useAppParam('match');

  return (
    <>
      <h3>Match Options</h3>
      {matchId ? <ViewMatch /> : <CreateMatch collectionId={collectionId} />}
    </>
  );
};

const ViewMatch = () => {
  const dispatch = useAppDispatch();
  const matchId = useAppParam('match');
  const updateAppParams = useUpdateAppParams();
  const selectionSize = useAppSelector(
    (state) => state.collections.currentSelection.length
  );

  const matchQuery = getMatch.useQuery(matchId || '', {
    skip: !matchId,
  });
  useBackoffPolling(
    matchQuery,
    (result) => !!(result.error || result.data?.state !== 'processing')
  );
  const match = matchQuery.data;

  const matchCount = match?.state === 'complete' ? match.matches.length : 0;
  const upaCount =
    match?.state === 'complete'
      ? match.upas.flatMap((upaList) => upaList.split(';')).length
      : 0;

  const handleClear = () => {
    updateAppParams({ match: null });
  };

  const handleSelectAll = () => {
    if (match?.state !== 'complete') return;
    dispatch(
      setUserSelection(
        Array.from(
          new Set([
            ...store.getState().collections.currentSelection,
            ...match.matches,
          ])
        )
      )
    );
  };
  const handleDeselectAll = () => {
    if (match?.state !== 'complete') return;
    const matchSet = new Set(match.matches);
    dispatch(
      setUserSelection(
        store
          .getState()
          .collections.currentSelection.filter((sel) => !matchSet.has(sel))
      )
    );
  };

  const matchTooLargeForSelection =
    match?.state === 'complete' && selectionSize + match.matches.length > 10000;

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
              matching{' '}
              <strong className={classes['match-highlight']}>
                {matchCount}
              </strong>{' '}
              collection items.
            </li>
          ) : (
            <></>
          )}
        </ul>
      )}
      <Button onClick={handleClear}>Clear Match</Button>
      <Button
        onClick={handleSelectAll}
        disabled={match?.state !== 'complete' || matchTooLargeForSelection}
        title={
          matchTooLargeForSelection
            ? 'Cannot select this match (too many items)'
            : ''
        }
      >
        Select All Matched
      </Button>
      <Button
        onClick={handleDeselectAll}
        disabled={match?.state !== 'complete'}
      >
        Deselect All Matched
      </Button>
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
  const [narrativeSearch, setNarrativeSearch] = useState('');
  const [narrativeSel, setNarrativeSel] = useState<SelectOption | undefined>();
  const narrativeSearchParams = useParamsForNarrativeDropdown(narrativeSearch);
  const narrativeQuery = getNarratives.useQuery(narrativeSearchParams);
  const narrativeOptions = (narrativeQuery?.data?.hits || []).map((hit) => ({
    value: [hit.access_group, hit.obj_id, hit.version].join('/'),
    label: hit.narrative_title,
    data: hit,
  }));
  const narrativeSelected = narrativeOptions.find(
    (d) => d.value === narrativeSel?.value
  )?.data;

  // DataObj selection
  const [dataObjSel, setDataObjSel] = useState<SelectOption[]>([]);

  const dataObjQuery = listObjects.useQuery({
    ids: narrativeSelected?.access_group
      ? [narrativeSelected?.access_group]
      : [],
  });

  const allTypes = [
    ...(matcherSelected?.types || []),
    ...(matcherSelected?.set_types || []),
  ];

  const dataObjOptions = (dataObjQuery?.data?.[0] || [])
    .map((objInfo) => ({
      value: `${narrativeSelected?.access_group}/${objInfo[0]}/${objInfo[4]}`,
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
    <div className={classes['matching']}>
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
        onSearch={setNarrativeSearch}
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
      <Button
        disabled={
          !(matcherSelected && narrativeSelected && dataObjSel.length > 0)
        }
        onClick={handleCreate}
      >
        Create Match
      </Button>
      <br></br>
      <code>{matchErr}</code>
    </div>
  );
};
