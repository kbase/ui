/* NarrativeControl/Copy */
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../common/components';
import {
  inputRegisterFactory,
  MAX_WS_METADATA_VALUE_SIZE,
} from '../../../common/components/Input.common';
import { Input } from '../../../common/components/Input';
import { useAppDispatch } from '../../../common/hooks';
import { TODOAddLoadingState } from '../common';
import { useNarrativeServiceStatus } from '../hooks';
import { copyNarrative } from '../navigatorSlice';
import { ControlProps } from './common';

export interface CopyValues {
  narrativeCopyName: string;
}

export interface CopyProps extends ControlProps {
  version: number;
}

export const Copy: FC<CopyProps> = ({ narrativeDoc, modalClose, version }) => {
  const dispatch = useAppDispatch();
  useNarrativeServiceStatus();
  const { formState, getValues, register } = useForm<CopyValues>({
    defaultValues: {
      narrativeCopyName: `${narrativeDoc.narrative_title} - Copy`,
    },
    mode: 'all',
  });
  const inputRegister = inputRegisterFactory<CopyValues>({
    formState,
    register,
  });
  const copyNarrativeHandler = async () => {
    const { narrativeCopyName: name } = getValues();
    await TODOAddLoadingState();
    dispatch(copyNarrative({ wsId: narrativeDoc.access_group, name, version }));
    modalClose();
  };
  return (
    <>
      <p>
        {version < narrativeDoc.version
          ? 'Make a copy of this version '
          : 'Make a Copy'}
      </p>
      <p>Enter a name for the new Narrative.</p>
      <div>
        <Input
          label={<>New Narrative Title</>}
          {...inputRegister('narrativeCopyName', {
            maxLength: {
              value: MAX_WS_METADATA_VALUE_SIZE,
              message: 'too long',
            },
          })}
        />
        <Button onClick={copyNarrativeHandler}>OK</Button>
        <Button onClick={modalClose}>Cancel</Button>
      </div>
    </>
  );
};
