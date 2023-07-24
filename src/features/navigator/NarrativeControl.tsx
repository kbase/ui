import { FC, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ModalContext } from '../../app/App';
import { Button, Dropdown } from '../../common/components';
import { NarrativeDoc } from '../../common/types/NarrativeDoc';
import { normalizeVersion } from './common';
import { Copy } from './NarrativeControlCopy';
import { Delete } from './NarrativeControlDelete';
import { Orgs } from './NarrativeControlOrgs';
import { Restore } from './NarrativeControlRestore';
import { Rename } from './NarrativeControlRename';
import { Share } from './NarrativeControlShare';

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

interface ControlLatestProps {
  narrativeDoc: NarrativeDoc;
}

const ControlLatest: FC<ControlLatestProps> = ({ narrativeDoc }) => {
  const { getModalControls, setModalContents } = useContext(ModalContext);
  const { modalClose } = getModalControls();
  const { version } = narrativeDoc;
  const controlLatestDialogs: Record<string, JSX.Element> = {
    'Copy this Narrative': (
      <Copy
        narrativeDoc={narrativeDoc}
        modalClose={modalClose}
        version={version}
      />
    ),
    Delete: <Delete narrativeDoc={narrativeDoc} modalClose={modalClose} />,
    'Link to Organization': (
      <Orgs narrativeDoc={narrativeDoc} modalClose={modalClose} />
    ),
    'Manage Sharing': (
      <Share narrativeDoc={narrativeDoc} modalClose={modalClose} />
    ),
    Rename: <Rename narrativeDoc={narrativeDoc} modalClose={modalClose} />,
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
  const controlPreviousDialogs: Record<string, JSX.Element> = {
    'Copy this version': (
      <Copy
        narrativeDoc={narrativeDoc}
        modalClose={modalClose}
        version={version}
      />
    ),
    'Restore Version': (
      <Restore
        modalClose={modalClose}
        narrativeDoc={narrativeDoc}
        version={version}
      />
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
