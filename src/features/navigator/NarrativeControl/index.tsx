/* NarrativeControl */
import { FC, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Dropdown } from '../../../common/components';
import { NarrativeDoc } from '../../../common/types/NarrativeDoc';
import { Modal, useModalControls } from '../../layout/Modal';
import { normalizeVersion } from '../common';
import { Copy } from './Copy';
import { Delete } from './Delete';
import { LinkOrg } from './LinkOrg';
import { Restore } from './Restore';
import { Rename } from './Rename';
import { Share } from './Share';

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
  const [modalView, setModalView] = useState('Copy this Narrative');
  const modal = useModalControls();
  const controlLatestDialogs: Record<string, JSX.Element> = useMemo(() => {
    const modalClose = () => modal?.close();
    const { version } = narrativeDoc;
    return {
      'Copy this Narrative': (
        <Copy
          narrativeDoc={narrativeDoc}
          modalClose={modalClose}
          version={version}
        />
      ),
      Delete: <Delete narrativeDoc={narrativeDoc} modalClose={modalClose} />,
      'Link to Organization': (
        <LinkOrg narrativeDoc={narrativeDoc} modalClose={modalClose} />
      ),
      'Manage Sharing': (
        <Share narrativeDoc={narrativeDoc} modalClose={modalClose} />
      ),
      Rename: <Rename narrativeDoc={narrativeDoc} modalClose={modalClose} />,
    };
  }, [modal, narrativeDoc]);
  return (
    <>
      <Dropdown
        horizontalMenuAlign={'right'}
        options={[{ options: controlLatestOptions }]}
        onChange={(opt) => {
          setModalView(opt[0].value.toString());
          modal?.show();
        }}
      >
        <div>Latest</div>
      </Dropdown>
      <Modal body={controlLatestDialogs[modalView]} title={modalView} />
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
  const [modalView, setModalView] = useState('Copy this Narrative');
  const modal = useModalControls();
  const modalClose = () => modal?.close();
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
    <>
      <Dropdown
        horizontalMenuAlign={'right'}
        options={[{ options: controlPreviousOptions }]}
        onChange={(opt) => {
          setModalView(opt[0].value.toString());
          modal?.show();
        }}
      >
        <div>Previous</div>
      </Dropdown>
      <Modal body={controlPreviousDialogs[modalView]} title={modalView} />
    </>
  );
};

export interface NarrativeControlProps {
  narrativeDoc: NarrativeDoc;
}

const NarrativeControl: FC<NarrativeControlProps> = ({ narrativeDoc }) => {
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
