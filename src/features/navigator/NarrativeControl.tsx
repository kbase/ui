import { FC, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ModalContext } from '../../app/App';
import { Button, Dropdown } from '../../common/components';
import { NarrativeDoc } from '../../common/types/NarrativeDoc';

interface ControlProps {
  narrativeDoc: NarrativeDoc;
}

const Delete: FC<{ no: () => void }> = ({ no }) => {
  return (
    <>
      Are you sure you want to delete this narrative?
      <Button>Yes</Button>
      <Button onClick={no}>No</Button>
    </>
  );
};

interface ControlResponses {
  deleteNo: () => void;
}

const controlLatestDialogsFactory = ({ deleteNo }: ControlResponses) => {
  const dialogs: Record<string, JSX.Element> = {
    'Copy this Narrative': <>Copy this Narrative</>,
    Delete: <Delete no={deleteNo} />,
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

const ControlLatest: FC<ControlProps> = ({ narrativeDoc }) => {
  const { getModalControls, setModalContents } = useContext(ModalContext);
  const { modalClose } = getModalControls();
  const controlLatestDialogs = controlLatestDialogsFactory({
    deleteNo: modalClose,
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

const controlPreviousOptions = [<li>Copy</li>, <li>Restore</li>].map(
  (option) => ({
    value: '',
    icon: undefined,
    label: <div>{option} </div>,
  })
);

const ControlPrevious: FC<ControlProps> = ({ narrativeDoc }) => {
  return (
    <Dropdown
      horizontalMenuAlign={'right'}
      options={[{ options: controlPreviousOptions }]}
      onChange={(opt) => {
        console.log({ opt }); // eslint-disable-line no-console
      }}
    >
      <div>Previous</div>
    </Dropdown>
  );
};

const NarrativeControl: FC<{ narrativeDoc: NarrativeDoc }> = ({
  narrativeDoc,
}) => {
  const { ver } = useParams();
  const { version } = narrativeDoc;
  return (
    <>
      {!ver || ver === version.toString() ? (
        <ControlLatest narrativeDoc={narrativeDoc} />
      ) : (
        <ControlPrevious narrativeDoc={narrativeDoc} />
      )}
    </>
  );
};

export default NarrativeControl;
