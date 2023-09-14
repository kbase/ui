/* NarrativeControl/Rename */
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { isKBaseBaseQueryError } from '../../../common/api/utils/common';
import { parseError } from '../../../common/api/utils/parseError';
import { renameNarrative } from '../../../common/api/narrativeService';
import { Button } from '../../../common/components';
import {
  inputRegisterFactory,
  MAX_WS_METADATA_VALUE_SIZE,
} from '../../../common/components/Input.common';
import { Input } from '../../../common/components/Input';
import { useAppDispatch } from '../../../common/hooks';
import { NarrativeDoc } from '../../../common/types/NarrativeDoc';
import { renameNarrative as renameAction, setLoading } from '../navigatorSlice';
import { ErrorMessage } from './common';

interface RenameValues {
  narrativeRenameName: string;
}

export const Rename: FC<{
  narrativeDoc: NarrativeDoc;
  modalClose: () => void;
}> = ({ narrativeDoc, modalClose }) => {
  /* hooks */
  const dispatch = useAppDispatch();
  const { formState, getValues, register } = useForm<RenameValues>({
    defaultValues: {
      narrativeRenameName: narrativeDoc.narrative_title,
    },
    mode: 'all',
  });
  const [renameTrigger] = renameNarrative.useMutation();
  /* derived values */
  const { access_group: wsId, obj_id: objId } = narrativeDoc;
  const inputRegister = inputRegisterFactory<RenameValues>({
    formState,
    register,
  });
  const errors = formState.errors;
  const errorEntries = Object.entries(errors);
  const formInvalid = errorEntries.length > 0;
  /* rename narrative callback */
  const renameNarrativeHandler = async () => {
    const { narrativeRenameName: name } = getValues();
    const message = `Rename ${wsId} to ${name}.`;
    modalClose();
    dispatch(renameAction({ wsId: narrativeDoc.access_group, name }));
    try {
      await renameTrigger({
        narrativeRef: `${wsId}/${objId}`,
        nameNew: name,
      }).unwrap();
      dispatch(setLoading(false));
    } catch (err) {
      if (!isKBaseBaseQueryError(err)) {
        console.error({ err }); // eslint-disable-line no-console
        toast(ErrorMessage({ err }));
        return;
      }
      toast(ErrorMessage({ err: parseError(err) }));
      dispatch(setLoading(false));
      return;
    }
    toast(message);
  };
  /* Rename component */
  return (
    <>
      <p>Rename Narrative</p>
      <p>Enter a new name for the Narrative:</p>

      <div>
        {formInvalid ? (
          <>
            Errors:
            <ul>
              {Object.entries(errors).map(([name, err]) => (
                <li key={name}>{err.message}</li>
              ))}
            </ul>
          </>
        ) : (
          <></>
        )}
        <Input
          label={<>New Narrative Title</>}
          maxLength={MAX_WS_METADATA_VALUE_SIZE}
          {...inputRegister('narrativeRenameName', {
            maxLength: {
              value: MAX_WS_METADATA_VALUE_SIZE,
              message: 'The selected name is too long.',
            },
          })}
        />
        <Button disabled={formInvalid} onClick={renameNarrativeHandler}>
          OK
        </Button>
        <Button onClick={modalClose}>Cancel</Button>
      </div>
    </>
  );
};
