/* NarrativeControl/Rename */
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../common/components';
import {
  inputRegisterFactory,
  MAX_WS_METADATA_VALUE_SIZE,
} from '../../../common/components/Input.common';
import { Input } from '../../../common/components/Input';
import { useAppDispatch } from '../../../common/hooks';
import { NarrativeDoc } from '../../../common/types/NarrativeDoc';
import { TODOAddLoadingState } from '../common';
import { renameNarrative } from '../navigatorSlice';

interface RenameValues {
  narrativeRenameName: string;
}

export const Rename: FC<{
  narrativeDoc: NarrativeDoc;
  modalClose: () => void;
}> = ({ narrativeDoc, modalClose }) => {
  const dispatch = useAppDispatch();
  const { formState, getValues, register } = useForm<RenameValues>({
    defaultValues: {
      narrativeRenameName: narrativeDoc.narrative_title,
    },
    mode: 'all',
  });
  const inputRegister = inputRegisterFactory<RenameValues>({
    formState,
    register,
  });
  const renameNarrativeHandler = async () => {
    const { narrativeRenameName: name } = getValues();
    await TODOAddLoadingState();
    dispatch(renameNarrative({ wsId: narrativeDoc.access_group, name }));
    modalClose();
  };
  return (
    <>
      <p>Rename Narrative</p>
      <p>Enter a new name for the Narrative:</p>

      <div>
        <Input
          label={<>New Narrative Title</>}
          {...inputRegister('narrativeRenameName', {
            maxLength: {
              value: MAX_WS_METADATA_VALUE_SIZE,
              message: 'too long',
            },
          })}
        />
        <Button onClick={renameNarrativeHandler}>OK</Button>
        <Button onClick={modalClose}>Cancel</Button>
      </div>
    </>
  );
};
