import { FC, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ModalContext } from '../../app/App';
import { Button, Dropdown } from '../../common/components';
import { NarrativeDoc } from '../../common/types/NarrativeDoc';
import { normalizeVersion } from './common';
import {
  Copy,
  CopyValues,
  Delete,
  Rename,
  RenameValues,
  Restore,
} from './NarrativeControlDialogs';

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

interface ControlLatestProps {
  narrativeDoc: NarrativeDoc;
}

const ControlLatest: FC<ControlLatestProps> = ({ narrativeDoc }) => {
  const { getModalControls, setModalContents } = useContext(ModalContext);
  const { modalClose } = getModalControls();
  const { access_group, version } = narrativeDoc;
  const copyYesFactory =
    ({
      getValues,
      version,
    }: {
      getValues: () => CopyValues;
      version: number;
    }) =>
    async () => {
      const values = getValues();
      const { narrativeCopyName } = values;
      await copyNarrative(
        narrativeDoc.access_group,
        version,
        narrativeCopyName
      );
      modalClose();
    };
  const deleteYes = async () => {
    await deleteNarrative(access_group);
    modalClose();
  };
  const renameYesFactory =
    ({ getValues }: { getValues: () => RenameValues }) =>
    async () => {
      const values = getValues();
      const { narrativeRenameName } = values;
      await renameNarrative(narrativeDoc.access_group, narrativeRenameName);
      modalClose();
    };
  const controlLatestDialogs: Record<string, JSX.Element> = {
    'Copy this Narrative': (
      <Copy
        narrativeDoc={narrativeDoc}
        no={modalClose}
        version={version}
        yesFactory={copyYesFactory}
      />
    ),
    Delete: <Delete no={modalClose} yes={deleteYes} />,
    'Link to Organization': <>Link to Organization</>,
    'Manage Sharing': <>Manage Sharing</>,
    Rename: (
      <Rename
        narrativeDoc={narrativeDoc}
        no={modalClose}
        yesFactory={renameYesFactory}
      />
    ),
  };
  return (
    <>
      <Dropdown
        horizontalMenuAlign={'right'}
        options={[{ options: controlLatestOptions }]}
        onChange={(opt) => {
          setModalContents(
            <span>
              {controlLatestDialogs[opt[0].value]}
              <Button onClick={modalClose}>Close Dialog</Button>
            </span>
          );
        }}
      >
        <div>Latest</div>
      </Dropdown>
    </>
  );
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
  const copyYesFactory =
    ({
      getValues,
      version,
    }: {
      getValues: () => CopyValues;
      version: number;
    }) =>
    async () => {
      const values = getValues();
      const { narrativeCopyName } = values;
      await copyNarrative(
        narrativeDoc.access_group,
        version,
        narrativeCopyName
      );
      modalClose();
    };
  const restoreYes = async () => {
    await restoreNarrative(narrativeDoc.access_group, Number(version));
    modalClose();
  };
  const controlPreviousDialogs: Record<string, JSX.Element> = {
    'Copy this version': (
      <Copy
        narrativeDoc={narrativeDoc}
        no={modalClose}
        version={version}
        yesFactory={copyYesFactory}
      />
    ),
    'Restore Version': (
      <Restore no={modalClose} version={version} yes={restoreYes} />
    ),
  };
  return (
    <Dropdown
      horizontalMenuAlign={'right'}
      options={[{ options: controlPreviousOptions }]}
      onChange={(opt) => {
        setModalContents(
          <span>
            {controlPreviousDialogs[opt[0].value]}
            <Button onClick={modalClose}>Close Dialog</Button>
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
