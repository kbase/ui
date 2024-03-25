import {
  createMatch,
  getCollectionMatchers,
  getMatch,
} from '../../common/api/collectionsApi';
import classes from './Collections.module.scss';
import { useEffect, useId, useMemo, useState } from 'react';
import { Button, Select, SelectOption } from '../../common/components';
import { listObjects } from '../../common/api/workspaceApi';
import { getNarratives } from '../../common/api/searchApi';
import { parseError } from '../../common/api/utils/parseError';
import { useUpdateAppParams } from '../params/hooks';
import { useAppDispatch, useBackoffPolling } from '../../common/hooks';
import {
  setLocalSelection,
  useCurrentSelection,
  useMatchId,
} from './collectionsSlice';
import { store } from '../../app/store';
import { useParamsForNarrativeDropdown } from './hooks';
import { MatcherUserParams } from './MatcherUserParams';
import Ajv from 'ajv';
import { Modal, useModalControls } from '../layout/Modal';
import { Loader } from '../../common/components/Loader';
import { useForm } from 'react-hook-form';
import { NarrativeDoc } from '../../common/types/NarrativeDoc';
import { Alert, Stack } from '@mui/material';
import {
  faCheckCircle,
  faSpinner,
  faWarning,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { snakeCaseToHumanReadable } from '../../common/utils/stringUtils';
import { marked } from 'marked';

export const MatchModal = ({ collectionId }: { collectionId: string }) => {
  const matchId = useMatchId(collectionId);

  return matchId ? (
    <ViewMatch collectionId={collectionId} key={matchId} />
  ) : (
    <CreateMatch collectionId={collectionId} />
  );
};

const ViewMatch = ({ collectionId }: { collectionId: string }) => {
  const dispatch = useAppDispatch();
  const matchId = useMatchId(collectionId);
  const updateAppParams = useUpdateAppParams();
  const selectionSize = useCurrentSelection(collectionId).length;
  const { close } = useModalControls();

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
  const matchStategy =
    match?.state === 'complete'
      ? snakeCaseToHumanReadable(match.matcher_id)
      : '';
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
        'Match data objects in your narrative to Genome data in this collection.'
      }
      body={
        <div>
          <Loader type="spinner" loading={matchQuery.isLoading}>
            <Stack
              sx={{
                justifyContent: 'center',
                marginTop: 4,
                marginBottom: 4,
                textAlign: 'center',
              }}
            >
              {match?.state === 'processing' && (
                <>
                  <div>
                    <FontAwesomeIcon icon={faSpinner} size="2x" spin />
                  </div>
                  <p>Processing match</p>
                </>
              )}
              {match?.state === 'complete' && (
                <>
                  <div>
                    <FontAwesomeIcon icon={faCheckCircle} size="2x" />
                  </div>
                  {matchCount === 1 && <p>Found {matchCount} match</p>}
                  {matchCount !== 1 && (
                    <p>Found {matchCount.toLocaleString()} matches</p>
                  )}
                </>
              )}
              {match?.state === 'failed' && (
                <>
                  <FontAwesomeIcon icon={faWarning} size="2x" />
                  <p>There was a problem processing your match</p>
                </>
              )}
            </Stack>
            {match?.state !== 'processing' && (
              <Alert severity="success">
                <Stack spacing={2}>
                  {match?.state === 'complete' ? (
                    <div>
                      You input a total of{' '}
                      <strong>{upaCount.toLocaleString()}</strong> data{' '}
                      {upaCount === 1 ? 'object' : 'objects'}, matching{' '}
                      <strong>{matchCount.toLocaleString()}</strong> collection{' '}
                      {matchCount === 1 ? 'item' : 'items'}.
                    </div>
                  ) : (
                    <></>
                  )}
                  <Stack spacing={1}>
                    <label>
                      <strong>Matching Strategy</strong>
                    </label>
                    <div>{matchStategy}</div>
                  </Stack>
                  <Stack spacing={1}>
                    <label>
                      <strong>Parameters</strong>
                    </label>
                    <div>
                      {Object.entries(match?.user_parameters || {}).map(
                        ([key, value]) => (
                          <div>
                            {snakeCaseToHumanReadable(key)}:{' '}
                            {JSON.stringify(value)}
                          </div>
                        )
                      )}
                    </div>
                  </Stack>
                </Stack>
              </Alert>
            )}
          </Loader>
        </div>
      }
      footer={
        <Stack
          direction="row"
          spacing={1}
          justifyContent="space-between"
          sx={{
            width: '100%',
          }}
        >
          <Stack direction="row" spacing={1}>
            <Button color="gray" onClick={handleClear}>
              Clear Match
            </Button>
            <Button
              color="gray"
              onClick={handleDeselectAll}
              disabled={match?.state !== 'complete'}
            >
              Deselect All Matched
            </Button>
            <Button
              color="gray"
              onClick={handleSelectAll}
              disabled={
                match?.state !== 'complete' || matchTooLargeForSelection
              }
              title={
                matchTooLargeForSelection
                  ? 'Cannot select this match (too many items)'
                  : ''
              }
            >
              Select All Matched
            </Button>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              onClick={() => close()}
              disabled={match?.state !== 'complete'}
            >
              Close
            </Button>
          </Stack>
        </Stack>
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

export const MATCHER_HELP_TEXT = new Map<string, string>(
  Object.entries({
    gtdb_lineage: `This matcher works by comparing the GTDB lineage from your input objects to the classification field for data in this collection.
    Input objects must have been run through the GTDB app in order to have lineage values.`,
    minhash_homology: `This matcher works by running a mash homology search using the input objects as queries against the collection data.
    More info: [https://doi.org/10.1186/s13059-016-0997-x](https://doi.org/10.1186/s13059-016-0997-x)`,
  })
);

const getMatcherLabel = (matcherId: string) =>
  MATCHER_LABELS.get(matcherId.toLowerCase()) ??
  `Unknown Matcher "${matcherId}"`;

const getMatcherHelpText = (matcherId: string) =>
  MATCHER_HELP_TEXT.get(matcherId.toLowerCase()) ??
  `Unknown Matcher "${matcherId}"`;

const CreateMatch = ({ collectionId }: { collectionId: string }) => {
  const updateAppParams = useUpdateAppParams();
  const matchersQuery = getCollectionMatchers.useQuery(collectionId);
  const matchers = matchersQuery.data?.data;

  const { register, setValue, watch, handleSubmit } = useForm<{
    matcher?: NonNullable<typeof matchers>[number];
    narrative?: NarrativeDoc;
    dataObjs: string[]; // UPAs
  }>({
    defaultValues: {
      dataObjs: [],
    },
    mode: 'all',
  });

  // Match Select
  const matcherSelected = watch('matcher');
  const matcherOptions: SelectOption[] = useMemo(() => {
    setValue('matcher', undefined);
    return (
      matchers?.map((matcher) => ({
        value: matcher.id,
        label: getMatcherLabel(matcher.id),
        data: matcher,
      })) || []
    );
  }, [matchers, setValue]);

  // Narrative Select
  const narrativeSelected = watch('narrative');
  const [narrativeSearch, setNarrativeSearch] = useState('');
  const narrativeSearchParams = useParamsForNarrativeDropdown(narrativeSearch);
  const narrativeQuery = getNarratives.useQuery(narrativeSearchParams);
  const narrativeOptions = (narrativeQuery?.data?.hits || []).map((hit) => ({
    value: [hit.access_group, hit.obj_id, hit.version].join('/'),
    label: hit.narrative_title,
    data: hit,
  }));

  // DataObjs selection
  const dataObjsSelected = watch('dataObjs');
  const dataObjsQuery = listObjects.useQuery({
    ids: narrativeSelected?.access_group
      ? [narrativeSelected?.access_group]
      : [],
  });

  const allObjTypes = [
    ...(matcherSelected?.types || []),
    ...(matcherSelected?.set_types || []),
  ];

  const dataObjsOptions = (dataObjsQuery?.data?.[0] || [])
    .map((objInfo) => ({
      value: `${narrativeSelected?.access_group}/${objInfo[0]}/${objInfo[4]}`,
      label: objInfo[1],
      data: objInfo,
    }))
    .filter((opt) =>
      allObjTypes.some((matchType) => opt.data[2].startsWith(matchType))
    );

  // Matches
  let matchErr = '';
  const [triggerCreateMatch, createMatchResult] = createMatch.useMutation();

  const matchUserParams = matcherSelected?.user_parameters;
  const [userParams, setUserParams] = useState<
    Record<string, unknown> | undefined
  >(undefined);

  useEffect(() => {
    //When the matcher changes, reset user params
    return () => setUserParams({});
  }, [matcherSelected?.id]);

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
    dataObjsSelected.length > 0
  );

  const handleCreate = handleSubmit(() => {
    triggerCreateMatch({
      collection_id: collectionId,
      matcher_id: matcherSelected?.id || '',
      upas: dataObjsSelected,
      parameters: userParams ?? {},
    });
  });

  if (createMatchResult.isError) {
    matchErr = JSON.parse(parseError(createMatchResult.error).message).error
      .message;
  }

  const createdMatchId = createMatchResult.data?.match_id;
  useEffect(() => {
    if (createMatchResult.isSuccess && createdMatchId)
      updateAppParams({ match: createdMatchId });
  }, [createMatchResult.isSuccess, createdMatchId, updateAppParams]);

  const idMatcher = useId();
  const idNarrative = useId();
  const idDataObject = useId();

  // React complains that the provided ref is useless for a FC.
  const registerMatcher = Object.fromEntries(
    Object.entries(register('matcher')).filter(([key]) => key !== 'ref')
  );
  return (
    <Modal
      title={'Match Data Object'}
      subtitle={
        'Match data objects in this collection to objects in a narrative.'
      }
      body={
        <Stack className={classes['match-modal']} spacing={2}>
          <Stack spacing={2}>
            <Stack spacing={1}>
              <label htmlFor={idMatcher}>Select matching strategy</label>
              <Select
                id={idMatcher}
                disabled={!matchersQuery.data}
                loading={matchersQuery.isFetching}
                options={matcherOptions}
                {...registerMatcher}
                onChange={(opt) => {
                  setValue(
                    'matcher',
                    matchers?.find((d) => d.id === opt[0]?.value)
                  );
                  setValue('dataObjs', []);
                }}
              />
              {matcherSelected && (
                <Alert severity="info">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: marked(getMatcherHelpText(matcherSelected.id)),
                    }}
                  />
                </Alert>
              )}
            </Stack>
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
          </Stack>
          <Stack spacing={1}>
            <label htmlFor={idNarrative}>Narrative Test</label>
            <Select
              id={idNarrative}
              disabled={!matcherSelected}
              options={narrativeOptions}
              menuPlacement="auto"
              loading={narrativeQuery.isFetching}
              onSearch={setNarrativeSearch}
              onChange={(opt) => {
                setValue(
                  'narrative',
                  narrativeOptions.find((d) => d.value === opt[0]?.value)?.data
                );
                setValue('dataObjs', []);
              }}
            />
          </Stack>
          <Stack spacing={1}>
            <label htmlFor={idDataObject}>Data Object(s)</label>
            <Select
              id={idDataObject}
              key={JSON.stringify(narrativeSelected)}
              multiple={true}
              disabled={!narrativeSelected}
              options={dataObjsOptions}
              menuPlacement="auto"
              loading={dataObjsQuery.isFetching}
              onChange={(opts) =>
                setValue(
                  'dataObjs',
                  opts.map((opt) => opt.value.toString())
                )
              }
            />
          </Stack>
          <br></br>
          {matchErr ? (
            <Alert severity="error">
              <label>
                <strong>Encountered a problem building your match</strong>
              </label>
              <div>{matchErr}</div>
            </Alert>
          ) : null}
        </Stack>
      }
      footer={
        <Button disabled={createReady} onClick={handleCreate}>
          Create Match
        </Button>
      }
    />
  );
};
