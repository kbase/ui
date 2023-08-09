import { useMemo, useState } from 'react';
import {
  exportSelection,
  getSelectionTypes,
  parseCollectionsError,
} from '../../common/api/collectionsApi';
import { getNarratives } from '../../common/api/searchApi';
import { Select, Input, Button, SelectOption } from '../../common/components';
import { uriEncodeTemplateTag as encode } from '../../common/utils/stringUtils';
import { useModal } from '../layout/Modal';
import { useSelectionId } from './collectionsSlice';
import { useParamsForNarrativeDropdown } from './hooks';

export const ExportModal = ({ collectionId }: { collectionId: string }) => {
  const selectionId = useSelectionId(collectionId);
  const [name, setName] = useState<string>('');
  const [desc, setDesc] = useState<string>('');
  const [narrativeSel, setNarrativeSel] = useState<SelectOption | undefined>();
  const [typeSel, setTypeSel] = useState<SelectOption | undefined>();
  const [narrativeSearch, setNarrativeSearch] = useState('');

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

  const typesParams = useMemo(
    () => ({ selection_id: selectionId ?? '' }),
    [selectionId]
  );
  const typesResult = getSelectionTypes.useQuery(typesParams, {
    skip: !selectionId,
  });

  const [triggerExport, exportResult] = exportSelection.useMutation();
  const handleExport = () => {
    if (!complete) return;
    triggerExport({
      selection_id: selectionId,
      workspace_id: narrativeSelected?.access_group.toString(),
      ws_type: typeSel?.value.toString(),
      object_name: name,
      description: desc,
    });
  };

  let exportError = '';
  const parsedErr = parseCollectionsError(exportResult.error);
  if (parsedErr) {
    exportError = `${parsedErr.error.httpcode}: ${parsedErr.error.message}`;
  } else if (exportResult.error) {
    exportError = 'An unknown error occurred while saving to the narrative.';
  }

  const complete =
    selectionId && typeSel?.value && narrativeSelected?.access_group && name;
  const modal = useModal();
  return modal.useContent({
    title: 'Save To Narrative',
    body: (
      <>
        <Select
          placeholder="Select export type..."
          disabled={typesResult.isFetching}
          onChange={(opts) => setTypeSel(opts[0])}
          options={(typesResult.data?.types ?? []).map((type) => ({
            value: type,
            label: type,
          }))}
        />
        <Select
          placeholder="Select narrative..."
          onSearch={setNarrativeSearch}
          onChange={(opts) => setNarrativeSel(opts[0])}
          options={narrativeOptions}
        />
        <Input
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          label={<>Object Name</>}
        />
        <Input
          value={desc}
          onChange={(e) => setDesc(e.currentTarget.value)}
          label={<>Object description (optional)</>}
        />
        {exportError ? <p className="">{exportError}</p> : <></>}
        {exportResult.data ? (
          <p className="">
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
          </p>
        ) : (
          <></>
        )}
      </>
    ),
    footer: (
      <Button
        disabled={!complete || exportResult.isLoading}
        onClick={handleExport}
      >
        Save to Narrative
      </Button>
    ),
  });
};
