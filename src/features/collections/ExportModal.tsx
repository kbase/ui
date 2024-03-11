import { useEffect, useMemo, useState } from 'react';
import {
  exportSelection,
  getSelectionTypes,
  parseCollectionsError,
} from '../../common/api/collectionsApi';
import { getNarratives } from '../../common/api/searchApi';
import { Select, Input, Button, SelectOption } from '../../common/components';
import { uriEncodeTemplateTag as encode } from '../../common/utils/stringUtils';
import { Modal } from '../layout/Modal';
import { useAppParam } from '../params/hooks';
import { useSelectionId } from './collectionsSlice';
import { useParamsForNarrativeDropdown } from './hooks';
import { Alert, Stack } from '@mui/material';
import classes from './Collections.module.scss';
import { useAppSelector } from '../../common/hooks';
import { getwsPermissions } from '../../common/api/workspaceApi';
import { NarrativeDoc } from '../../common/types/NarrativeDoc';

export const ExportModal = ({ collectionId }: { collectionId: string }) => {
  const selectionId = useSelectionId(collectionId);
  const matchId = useAppParam('match');
  const username = useAppSelector((state) => state.auth.username);

  const [type, setType] = useState<SelectOption | undefined>();
  const [narrativeSearch, setNarrativeSearch] = useState('');
  const [narrative, setNarrative] = useState<NarrativeDoc | undefined>();
  const [name, setName] = useState<string>('');
  const [desc, setDesc] = useState<string>('');
  const [showFormErrors, setShowFormErrors] = useState(false);

  // Reset state on selectionId change
  useEffect(() => {
    setType(undefined);
    setNarrativeSearch('');
    setNarrative(undefined);
    setName('');
    setDesc('');
    setShowFormErrors(false);
  }, [selectionId]);

  const narrativeSearchParams = useParamsForNarrativeDropdown(narrativeSearch);
  const narrativeQuery = getNarratives.useQuery(narrativeSearchParams);
  const narrativePermParams = useMemo(
    () => ({
      wsIds: Array.from(
        new Set(
          (narrativeQuery?.data?.hits || []).map((hit) => {
            return hit.access_group;
          })
        )
      ),
    }),
    [narrativeQuery?.data?.hits]
  );
  const wsPermissions = getwsPermissions.useQuery(narrativePermParams, {
    skip: !narrativeQuery?.data?.hits.length || !username,
  });
  const permittedWs = (wsPermissions?.data?.[0]?.perms ?? []).flatMap(
    (perm, index) => {
      const permitted = ['a', 'w'].includes(perm[username || '']);
      return permitted ? [narrativePermParams.wsIds[index]] : [];
    }
  );
  const permittedNarratives = (narrativeQuery?.data?.hits || []).filter(
    (narrative) => permittedWs.includes(narrative.access_group)
  );

  const typesParams = useMemo(
    () => ({ selection_id: selectionId ?? '' }),
    [selectionId]
  );
  const typesResult = getSelectionTypes.useQuery(typesParams, {
    skip: !selectionId,
  });

  const typeTitle = type?.value.toString().endsWith('.Genome')
    ? 'Genome'
    : type?.value.toString().endsWith('.Assembly')
    ? 'Assembly'
    : '';

  const formErrors: string[] = [];
  if (!type) formErrors.push('No type selected.');
  if (!narrative) formErrors.push('No narrative selected.');
  if (!name) formErrors.push('Name is required.');
  if (!/^[a-z0-9_.-]*$/i.test(name))
    formErrors.push('Name must be alphanumeric (A-Z, -, _, .) with no spaces.');
  if (Number.isInteger(Number(name)))
    formErrors.push('Name must not be an integer.');

  const [triggerExport, exportResult] = exportSelection.useMutation();

  const handleExport = () => {
    setShowFormErrors(true);
    if (formErrors.length > 0 || !narrative || !selectionId || !type) return;
    triggerExport({
      selection_id: selectionId,
      workspace_id: narrative.access_group.toString(),
      ws_type: 'badtype', //type.value.toString(),
      object_name: name,
      description: desc,
      match_id: matchId,
    });
  };

  const parsedErr = parseCollectionsError(exportResult.error);

  let exportError = '';
  if (parsedErr) {
    exportError = `${parsedErr.error.message}`;
  } else if (exportResult.error) {
    exportError = 'An unknown error occurred while saving to the narrative.';
  }

  return (
    <Modal
      title={'Save To Narrative'}
      body={
        <Stack className={classes['export-modal']} spacing={2}>
          <Stack spacing={1}>
            <label>Export type</label>
            <Select
              placeholder="Select export type..."
              disabled={typesResult.isFetching}
              onChange={(opts) => setType(opts[0])}
              options={(typesResult.data?.types ?? []).map((type) => ({
                value: type,
                label: type,
              }))}
            />
          </Stack>
          <Stack spacing={1}>
            <label>Narrative to export to</label>
            <Select
              placeholder="Select narrative..."
              onSearch={setNarrativeSearch}
              onChange={(opts) =>
                setNarrative(
                  permittedNarratives.find(
                    (narrative) => opts[0].value === narrativeUpa(narrative)
                  )
                )
              }
              options={permittedNarratives.map((narrative) => ({
                value: narrativeUpa(narrative),
                label: narrative.narrative_title,
              }))}
            />
          </Stack>
          <Stack spacing={1}>
            <label>New {typeTitle ? typeTitle + ' ' : ''}Set Object Name</label>
            <Input
              value={name}
              onBlur={() => setShowFormErrors(true)}
              onChange={(e) => setName(e.currentTarget.value)}
            />
          </Stack>
          <Stack spacing={1}>
            <label>Object Description (optional)</label>
            <Input
              value={desc}
              onChange={(e) => setDesc(e.currentTarget.value)}
            />
          </Stack>
          {showFormErrors && formErrors.length ? (
            <Alert severity="warning" sx={{ whiteSpace: ' pre-line' }}>
              {formErrors.join('\n')}
            </Alert>
          ) : (
            <></>
          )}
          {exportError ? <Alert severity="error">{exportError}</Alert> : <></>}
          {exportResult.data ? (
            <Alert severity="success">
              <strong>Data object created!</strong>
              <ul>
                <li> {exportResult.data.set.type}</li>
                <li>{exportResult.data.set.upa}</li>
                <li>
                  <a
                    href={encode`/narrative/${
                      exportResult.data.set.upa.split('/')[0]
                    }`}
                  >
                    Go to Narrative
                  </a>
                </li>
                <li>
                  <a href={`/#dataview/${exportResult.data.set.upa}`}>
                    Go to DataView
                  </a>
                </li>
              </ul>
            </Alert>
          ) : (
            <></>
          )}
        </Stack>
      }
      footer={
        <Button
          onClick={handleExport}
          disabled={showFormErrors && formErrors.length > 0}
        >
          Save to Narrative
        </Button>
      }
    />
  );
};

const narrativeUpa = (narrative: NarrativeDoc) =>
  [narrative.access_group, narrative.obj_id, narrative.version].join('/');
