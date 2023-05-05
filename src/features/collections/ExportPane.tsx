import { useMemo, useState } from 'react';
import {
  exportSelection,
  getSelectionTypes,
} from '../../common/api/collectionsApi';
import { getNarratives } from '../../common/api/searchApi';
import { Select, Input, Button, SelectOption } from '../../common/components';
import { useAppSelector } from '../../common/hooks';
import { useParamsForNarrativeDropdown } from './hooks';

export const ExportPane = () => {
  const selectionId = useAppSelector((state) => state.collections.selection.id);
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

  const complete =
    selectionId && typeSel?.value && narrativeSelected?.access_group && name;
  return (
    <>
      <h3>Save To Narrative</h3>
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
      <Button disabled={!complete} onClick={handleExport}>
        Save to Narrative
      </Button>
    </>
  );
};
