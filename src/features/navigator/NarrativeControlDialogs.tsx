/* NarrativeControlDialogs */
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../common/components';
import { inputRegisterFactory } from '../../common/components/Input.common';
import { Input } from '../../common/components/Input';
import { NarrativeDoc } from '../../common/types/NarrativeDoc';

// See also https://github.com/kbaseapps/NarrativeService/blob/main/lib/NarrativeService/NarrativeManager.py#L9
const MAX_WS_METADATA_VALUE_SIZE = 900;

export interface CopyValues {
  narrativeCopyName: string;
}

export const Copy: FC<{
  narrativeDoc: NarrativeDoc;
  no: () => void;
  version: number;
  yesFactory: ({
    getValues,
    version,
  }: {
    getValues: () => CopyValues;
    version: number;
  }) => () => void;
}> = ({ narrativeDoc, no, version, yesFactory }) => {
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
        <Button onClick={yesFactory({ getValues, version })}>OK</Button>
        <Button onClick={no}>Cancel</Button>
      </div>
    </>
  );
};

export const Delete: FC<{ no: () => void; yes: () => void }> = ({
  no,
  yes,
}) => {
  return (
    <>
      <p>Delete Narrative?</p>
      <p>Deleting a Narrative will permanently remove it and all its data.</p>
      <p>This action cannot be undone!</p>
      <p>Continue?</p>
      <div>
        <Button onClick={yes}>Delete</Button>
        <Button onClick={no}>Cancel</Button>
      </div>
    </>
  );
};

export interface RenameValues {
  narrativeRenameName: string;
}

export const Rename: FC<{
  narrativeDoc: NarrativeDoc;
  no: () => void;
  yesFactory: ({ getValues }: { getValues: () => RenameValues }) => () => void;
}> = ({ narrativeDoc, no, yesFactory }) => {
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
        <Button onClick={yesFactory({ getValues })}>OK</Button>
        <Button onClick={no}>Cancel</Button>
      </div>
    </>
  );
};

export const Restore: FC<{ no: () => void; version: number; yes: () => void }> =
  ({ no, version, yes }) => {
    return (
      <>
        <p>
          Reverting a narrative will create a new version identical to v
          {version}.
        </p>

        <p>
          This new narrative can be reverted to an earlier version at any time.
        </p>

        <p>Do you wish to continue?</p>

        <div>
          <Button onClick={yes}>Revert</Button>
          <Button onClick={no}>Cancel</Button>
        </div>
      </>
    );
  };
