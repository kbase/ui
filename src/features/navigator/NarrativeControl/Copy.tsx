/* NarrativeControl/Copy */
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { isKBaseBaseQueryError } from '../../../common/api/utils/common';
import { parseError } from '../../../common/api/utils/parseError';
import { copyNarrative } from '../../../common/api/narrativeService';
import { Button } from '../../../common/components';
import {
  inputRegisterFactory,
  MAX_WS_METADATA_VALUE_SIZE,
} from '../../../common/components/Input.common';
import { Input } from '../../../common/components/Input';
import { useAppDispatch } from '../../../common/hooks';
import { copyNarrative as copyAction, setLoading } from '../navigatorSlice';
import { ControlProps, ErrorMessage } from './common';

export interface CopyValues {
  narrativeCopyName: string;
}

export interface CopyProps extends ControlProps {
  version: number;
}

export const Copy: FC<CopyProps> = ({ narrativeDoc, modalClose, version }) => {
  /* hooks */
  const dispatch = useAppDispatch();
  const { formState, getValues, register } = useForm<CopyValues>({
    defaultValues: {
      narrativeCopyName: `${narrativeDoc.narrative_title} - Copy`,
    },
    mode: 'all',
  });
  const [copyTrigger] = copyNarrative.useMutation();
  /* derived values */
  const inputRegister = inputRegisterFactory<CopyValues>({
    formState,
    register,
  });
  const { access_group: wsId, obj_id: objId } = narrativeDoc;
  const errors = formState.errors;
  const errorEntries = Object.entries(errors);
  const formInvalid = errorEntries.length > 0;
  /* copy narrative callback */
  const copyNarrativeHandler = async () => {
    const { narrativeCopyName: name } = getValues();
    const message = `Copy ${wsId}/${objId}/${version} as ${name}.`;
    modalClose();
    dispatch(copyAction({ wsId: narrativeDoc.access_group, name, version }));
    try {
      await copyTrigger({
        nameNew: name,
        workspaceRef: `${wsId}/${objId}/${version}`,
        workspaceId: wsId,
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
  /* Copy component */
  return (
    <>
      <p>
        {version < narrativeDoc.version
          ? 'Make a copy of this version '
          : 'Make a Copy'}
      </p>
      <p>Enter a name for the new Narrative.</p>
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
          {...inputRegister('narrativeCopyName', {
            maxLength: {
              value: MAX_WS_METADATA_VALUE_SIZE,
              message: 'The selected name is too long.',
            },
          })}
        />
        <Button disabled={formInvalid} onClick={copyNarrativeHandler}>
          OK
        </Button>
        <Button onClick={modalClose}>Cancel</Button>
      </div>
    </>
  );
};
