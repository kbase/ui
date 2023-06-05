import { FC, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ModalContext } from '../../app/App';
import { Button, Dropdown } from '../../common/components';
import { NarrativeDoc } from '../../common/types/NarrativeDoc';
import { normalizeVersion } from './common';

interface ControlLatestProps {
  narrativeDoc: NarrativeDoc;
}

const Delete: FC<{ no: () => void; yes: () => void }> = ({ no, yes }) => {
  return (
    <>
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

interface ControlLatestResponses {
  deleteNo: () => void;
  deleteYes: () => void;
}

const controlLatestDialogsFactory = ({
  deleteNo,
  deleteYes,
}: ControlLatestResponses) => {
  const dialogs: Record<string, JSX.Element> = {
    'Copy this Narrative': <>Copy this Narrative</>,
    Delete: <Delete no={deleteNo} yes={deleteYes} />,
    'Link to Organization': <>Link to Organization</>,
    'Manage Sharing': <>Manage Sharing</>,
    Rename: <>Rename</>,
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
  icon: undefined,
  label: <li>{option}</li>,
}));

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

const ControlLatest: FC<ControlLatestProps> = ({ narrativeDoc }) => {
  const { getModalControls, setModalContents } = useContext(ModalContext);
  const { modalClose } = getModalControls();
  const controlLatestDialogs = controlLatestDialogsFactory({
    deleteNo: modalClose,
    deleteYes: async () => {
      await deleteNarrative(narrativeDoc.access_group);
      modalClose();
    },
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

const Restore: FC<{ no: () => void; yes: () => void }> = ({ no, yes }) => {
  const version = 0;
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

interface ControlPreviousResponses {
  restoreNo: () => void;
  restoreYes: () => void;
}

const controlPreviousDialogsFactory = ({
  restoreNo,
  restoreYes,
}: ControlPreviousResponses) => {
  const dialogs: Record<string, JSX.Element> = {
    'Copy this version': <>Copy</>,
    'Restore Version': <Restore no={restoreNo} yes={restoreYes} />,
  };
  return dialogs;
};

const controlPreviousOptions = ['Copy this version', 'Restore Version'].map(
  (option) => ({
    value: option,
    icon: undefined,
    label: <li>{option}</li>,
  })
);

const restoreNarrative = async (wsId: number, version: number) => {
  const message = `Restore ${wsId}.`;
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
    restoreNo: modalClose,
    restoreYes: async () => {
      await restoreNarrative(narrativeDoc.access_group, Number(version));
      modalClose();
    },
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
  const { ver: verRaw } = useParams();
  const ver = Number(normalizeVersion(verRaw));
  const { version } = narrativeDoc;
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
