import { FC, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { ModalContext } from '../../app/App';
import { Button, Dropdown } from '../../common/components';
import { inputRegisterFactory } from '../../common/components/Input.common';
import { Input } from '../../common/components/Input';
import { NarrativeDoc } from '../../common/types/NarrativeDoc';
import { normalizeVersion } from './common';

// See also https://github.com/kbaseapps/NarrativeService/blob/main/lib/NarrativeService/NarrativeManager.py#L9
const MAX_WS_METADATA_VALUE_SIZE = 900;

interface ControlLatestProps {
  narrativeDoc: NarrativeDoc;
}

const Copy: FC<{
  narrativeDoc: NarrativeDoc;
  no: () => void;
  version: number;
  yes: () => void;
}> = ({ narrativeDoc, no, version, yes }) => {
  interface CopyValues {
    narrativeCopyName: string;
  }

  const { formState, register } = useForm<CopyValues>({
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
        <Button onClick={yes}>OK</Button>
        <Button onClick={no}>Cancel</Button>
      </div>
    </>
  );
};

const Rename: FC<{
  narrativeDoc: NarrativeDoc;
  no: () => void;
  yes: () => void;
}> = ({ narrativeDoc, no, yes }) => {
  interface RenameValues {
    narrativeRenameName: string;
  }

  const { formState, register } = useForm<RenameValues>({
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
        <Button onClick={yes}>OK</Button>
        <Button onClick={no}>Cancel</Button>
      </div>
    </>
  );
};

const Delete: FC<{ no: () => void; yes: () => void }> = ({ no, yes }) => {
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

interface ControlLatestParams {
  copyNo: () => void;
  copyYes: () => void;
  deleteNo: () => void;
  deleteYes: () => void;
  renameNo: () => void;
  renameYes: () => void;
  narrativeDoc: NarrativeDoc;
  version: number;
}

const controlLatestDialogsFactory = ({
  copyNo,
  copyYes,
  deleteNo,
  deleteYes,
  narrativeDoc,
  renameNo,
  renameYes,
  version,
}: ControlLatestParams) => {
  const dialogs: Record<string, JSX.Element> = {
    'Copy this Narrative': (
      <Copy
        narrativeDoc={narrativeDoc}
        no={copyNo}
        version={version}
        yes={copyYes}
      />
    ),
    Delete: <Delete no={deleteNo} yes={deleteYes} />,
    'Link to Organization': <>Link to Organization</>,
    'Manage Sharing': <>Manage Sharing</>,
    Rename: (
      <Rename narrativeDoc={narrativeDoc} no={renameNo} yes={renameYes} />
    ),
  };
  return dialogs;
};

const controlLatestOptions = [
  'Manage Sharing',
  'Copy this Narrative',
  'Rename',
  'Link to Organization',
  'Delete',
].map((option) => ({
  value: option,
  label: <li>{option}</li>,
}));

const copyNarrative = async (wsId: number, version: number, name: string) => {
  const message = `Copy version ${version} of ${wsId} with name ${name}.`;
  return new Promise((resolve) => {
    setTimeout(() => {
      // eslint-disable-next-line no-console
      console.log(message);
      resolve(message);
    }, 1000);
  });
};

const deleteNarrative = async (wsId: number) => {
  const message = `Delete ${wsId}.`;
  return new Promise((resolve) => {
    setTimeout(() => {
      // eslint-disable-next-line no-console
      console.log(message);
      resolve(message);
    }, 1000);
  });
};

const renameNarrative = async (wsId: number, name: string) => {
  const message = `Rename ${wsId} to ${name}.`;
  return new Promise((resolve) => {
    setTimeout(() => {
      // eslint-disable-next-line no-console
      console.log(message);
      resolve(message);
    }, 1000);
  });
};

const ControlLatest: FC<ControlLatestProps> = ({ narrativeDoc }) => {
  const { getModalControls, setModalContents } = useContext(ModalContext);
  const { modalClose } = getModalControls();
  const controlLatestDialogs = controlLatestDialogsFactory({
    copyNo: modalClose,
    copyYes: async () => {
      await copyNarrative(narrativeDoc.access_group, 1, 'new-name');
      modalClose();
    },
    deleteNo: modalClose,
    deleteYes: async () => {
      await deleteNarrative(narrativeDoc.access_group);
      modalClose();
    },
    renameNo: modalClose,
    renameYes: async () => {
      await renameNarrative(narrativeDoc.access_group, 'new-name');
      modalClose();
    },
    version: narrativeDoc.version,
    narrativeDoc,
  });
  const closeHandler = () => {
    modalClose();
  };
  const closeButton = <Button onClick={closeHandler}>Close Dialog</Button>;
  return (
    <>
      <Dropdown
        horizontalMenuAlign={'right'}
        options={[{ options: controlLatestOptions }]}
        onChange={(opt) => {
          setModalContents(
            <span>
              {controlLatestDialogs[opt[0].value]}
              {closeButton}
            </span>
          );
        }}
      >
        <div>Latest</div>
      </Dropdown>
    </>
  );
};

const Restore: FC<{ no: () => void; version: number; yes: () => void }> = ({
  no,
  version,
  yes,
}) => {
  return (
    <>
      <p>
        Reverting a narrative will create a new version identical to v{version}.
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

interface ControlPreviousParams {
  copyNo: () => void;
  copyYes: () => void;
  narrativeDoc: NarrativeDoc;
  restoreNo: () => void;
  restoreYes: () => void;
  version: number;
}

const controlPreviousDialogsFactory = ({
  copyNo,
  copyYes,
  restoreNo,
  restoreYes,
  narrativeDoc,
  version,
}: ControlPreviousParams) => {
  const dialogs: Record<string, JSX.Element> = {
    'Copy this version': (
      <Copy
        narrativeDoc={narrativeDoc}
        no={copyNo}
        version={version}
        yes={copyYes}
      />
    ),
    'Restore Version': (
      <Restore no={restoreNo} version={version} yes={restoreYes} />
    ),
  };
  return dialogs;
};

const controlPreviousOptions = ['Copy this version', 'Restore Version'].map(
  (option) => ({
    value: option,
    label: <li>{option}</li>,
  })
);

const restoreNarrative = async (wsId: number, version: number) => {
  const message = `Restore version ${version} of ${wsId}.`;
  return new Promise((resolve) => {
    setTimeout(() => {
      // eslint-disable-next-line no-console
      console.log(message);
      resolve(message);
    }, 1000);
  });
};

interface ControlPreviousProps {
  narrativeDoc: NarrativeDoc;
  version: number;
}

const ControlPrevious: FC<ControlPreviousProps> = ({
  narrativeDoc,
  version,
}) => {
  const { getModalControls, setModalContents } = useContext(ModalContext);
  const { modalClose } = getModalControls();
  const controlPreviousDialogs = controlPreviousDialogsFactory({
    copyNo: modalClose,
    copyYes: async () => {
      await copyNarrative(narrativeDoc.access_group, 1, 'new-name');
      modalClose();
    },
    restoreNo: modalClose,
    restoreYes: async () => {
      await restoreNarrative(narrativeDoc.access_group, Number(version));
      modalClose();
    },
    narrativeDoc,
    version,
  });
  const closeHandler = () => {
    modalClose();
  };
  const closeButton = <Button onClick={closeHandler}>Close Dialog</Button>;
  return (
    <Dropdown
      horizontalMenuAlign={'right'}
      options={[{ options: controlPreviousOptions }]}
      onChange={(opt) => {
        setModalContents(
          <span>
            {controlPreviousDialogs[opt[0].value]}
            {closeButton}
          </span>
        );
      }}
    >
      <div>Previous</div>
    </Dropdown>
  );
};

const NarrativeControl: FC<{ narrativeDoc: NarrativeDoc }> = ({
  narrativeDoc,
}) => {
  const { version } = narrativeDoc;
  const { ver: verRaw } = useParams();
  const ver = Math.min(Number(normalizeVersion(verRaw)), version);
  return (
    <>
      {!ver || ver === version ? (
        <ControlLatest narrativeDoc={narrativeDoc} />
      ) : (
        <ControlPrevious narrativeDoc={narrativeDoc} version={Number(ver)} />
      )}
    </>
  );
};

export default NarrativeControl;
