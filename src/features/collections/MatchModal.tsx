import {
  createMatch,
  getCollectionMatchers,
  getMatch,
} from '../../common/api/collectionsApi';
import classes from './Collections.module.scss';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Button, Select, SelectOption } from '../../common/components';
import { listObjects } from '../../common/api/workspaceApi';
import { getNarratives } from '../../common/api/searchApi';
import { parseError } from '../../common/api/utils/parseError';
import { useAppParam, useUpdateAppParams } from '../params/hooks';
import { useAppDispatch, useBackoffPolling } from '../../common/hooks';
import { setLocalSelection, useCurrentSelection } from './collectionsSlice';
import { store } from '../../app/store';
import { useParamsForNarrativeDropdown } from './hooks';
import { MatcherUserParams } from './MatcherUserParams';
import Ajv from 'ajv';
import { Modal } from '../layout/Modal';
import { Loader } from '../../common/components/Loader';

export const MatchModal = ({ collectionId }: { collectionId: string }) => {
  const matchId = useAppParam('match');

  return matchId ? (
    <ViewMatch collectionId={collectionId} key={matchId} />
  ) : (
    <CreateMatch collectionId={collectionId} />
  );
};

const ViewMatch = ({ collectionId }: { collectionId: string }) => {
  const dispatch = useAppDispatch();
  const matchId = useAppParam('match');
  const updateAppParams = useUpdateAppParams();
  const selectionSize = useCurrentSelection(collectionId).length;

  const matchQuery = getMatch.useQuery(matchId || '', {
    skip: !matchId,
  });
  useBackoffPolling(
    matchQuery,
    (result) =>
      !(
        Boolean(result.error) ||
        (Boolean(result.data?.state) && result.data?.state !== 'processing')
      )
  );
  const match = matchQuery.data;

  const matchCount = match?.state === 'complete' ? match.matches.length : 0;
  const upaCount = match?.state === 'complete' ? match.upas.length : 0;

  const handleClear = () => {
    updateAppParams({ match: null });
  };

  const handleSelectAll = () => {
    if (match?.state !== 'complete') return;
    const all = Array.from(
      new Set([
        ...(store.getState().collections.clns[collectionId]?.selection
          .current ?? []),
        ...match.matches,
      ])
    );
    dispatch(setLocalSelection([collectionId, all]));
  };
  const handleDeselectAll = () => {
    if (match?.state !== 'complete') return;
    const matchSet = new Set(match.matches);
    const minusMatch = (
      store.getState().collections.clns[collectionId]?.selection.current ?? []
    ).filter((sel) => !matchSet.has(sel));
    dispatch(setLocalSelection([collectionId, minusMatch]));
  };

  const matchTooLargeForSelection =
    match?.state === 'complete' && selectionSize + match.matches.length > 10000;

  return (
    <Modal
      title={'Match Data Object'}
      subtitle={
        'Match data objects in this collection to objects in a narrative.'
      }
      body={
        <Loader type="spinner" loading={matchQuery.isLoading}>
          <ul>
            <li>Match ID: {match?.match_id}</li>
            <li>Match Status: {match?.state}</li>
            <li>
              Match Params:{' '}
              <ul>
                {Object.entries(match?.user_parameters || {}).map(
                  ([key, value]) => (
                    <li>
                      {key}: {JSON.stringify(value)}
                    </li>
                  )
                )}
              </ul>
            </li>
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
        </Loader>
      }
      footer={
        <>
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
        </>
      }
    />
  );
};

export const MATCHER_LABELS = new Map<string, string>(
  Object.entries({
    gtdb_lineage: 'GTDB Lineage',
    minhash_homology: 'MinHash Homology',
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
  useEffect(() => setDataObjSel([]), [narrativeSel?.value]);

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

  const matchUserParams = matcherSelected?.user_parameters;
  const [userParams, setUserParams] = useState<
    Record<string, unknown> | undefined
  >(undefined);
  useEffect(() => setUserParams(undefined), [matcherSel?.value]);
  const validate = useMemo(
    () => new Ajv({ strict: false }).compile(matchUserParams ?? {}),
    [matchUserParams]
  );
  useEffect(() => {
    validate(userParams);
  }, [validate, userParams]);
  const createReady = !(
    matcherSelected &&
    narrativeSelected &&
    dataObjSel.length > 0
  );
  const handleCreate = useCallback(() => {
    triggerCreateMatch({
      collection_id: collectionId,
      matcher_id: matcherSelected?.id || '',
      upas: dataObjSel.map((d) => d.value.toString()),
      parameters: userParams ?? {},
    });
  }, [
    dataObjSel,
    collectionId,
    matcherSelected,
    triggerCreateMatch,
    userParams,
  ]);
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

  const idMatcher = useId();
  const idNarrative = useId();
  const idDataObject = useId();

  return (
    <Modal
      title={'Match Data Object'}
      subtitle={
        'Match data objects in this collection to objects in a narrative.'
      }
      body={
        <div className={classes['matching']}>
          <label htmlFor={idMatcher}>Matcher</label>
          <Select
            id={idMatcher}
            disabled={!matchersQuery.data}
            loading={matchersQuery.isFetching}
            value={matcherSel}
            options={matcherOptions}
            onChange={(opt) => {
              setMatcherSel(opt[0]);
              setDataObjSel([]);
            }}
          />
          {matchUserParams ? (
            <MatcherUserParams
              key={matcherSelected.id}
              params={matchUserParams}
              value={userParams}
              onChange={setUserParams}
              errors={(!validate(userParams) && validate.errors) || []}
            />
          ) : (
            <></>
          )}
          <label htmlFor={idNarrative}>Narrative</label>
          <Select
            id={idNarrative}
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
          <label htmlFor={idDataObject}>Data Object(s)</label>
          <Select
            id={idDataObject}
            key={narrativeSel?.value}
            multiple={true}
            disabled={!narrativeSelected}
            value={dataObjSel}
            options={dataObjOptions}
            loading={dataObjQuery.isFetching}
            onChange={(opts) => setDataObjSel(opts)}
          />
          <br></br>
          {matchErr ? (
            <>
              <br />
              <br />
              <code>{matchErr}</code>
            </>
          ) : null}
        </div>
      }
      footer={
        <Button disabled={createReady} onClick={handleCreate}>
          Create Match
        </Button>
      }
    />
  );
};
