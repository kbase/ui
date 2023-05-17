import { FC, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ModalContext } from '../../app/App';
import { Button, Dropdown } from '../../common/components';
import { NarrativeDoc } from '../../common/types/NarrativeDoc';
import appClasses from '../../app/App.module.scss';
import classes from './NarrativeControl.module.scss';

interface ControlProps {
  narrativeDoc: NarrativeDoc;
}

const getDeleteDialog = () => {
  let dialog: HTMLDialogElement | null = document.querySelector(
    `.${classes['narrative-control']}.${classes.delete}`
  );
  if (!dialog) {
    dialog = document.createElement('dialog');
    document.body.appendChild(dialog);
  }
  return dialog;
};

const deleteDialogToggle = () => {
  const dialog = getDeleteDialog();
  if (dialog.open) {
    return dialog.close();
  }
  console.log({ dialog }); // eslint-disable-line no-console
  dialog.close();
  dialog.showModal();
};

/* TODO: It seems DeleteDialog is working but the ModalContext is not... why?
    rerendering?
 */
const DeleteDialog: FC = () => {
  const closeHandler = () => {
    const dialog = getDeleteDialog();
    dialog.close();
  };
  return (
    <dialog className={`${classes['narrative-control']} ${classes.delete}`}>
      Are you sure you want to delete this narrative?
      <Button onClick={closeHandler}>Close Dialog</Button>
      <Button>Yes</Button>
      <Button onClick={closeHandler}>No</Button>
    </dialog>
  );
  // return <div onClick={clickHandler}>Delete {dialog} </div>;
};

const modalToggle = () => {
  // const dialog = getModal();
  const dialog: HTMLDialogElement | null = document.querySelector(
    `.${appClasses['kbase-modal']}`
  );
  console.log('modalToggle', { dialog }); // eslint-disable-line no-console
  if (!dialog || !dialog.close) return;
  dialog.close();
  dialog.showModal();
};

const controlLatestOptions = [
  <div onClick={modalToggle}>Manage Sharing</div>,
  <li>Copy this Narrative</li>,
  <li>Rename</li>,
  <li>Link to Organization</li>,
  <div onClick={deleteDialogToggle}>Delete</div>,
].map((option) => ({
  value: '',
  icon: undefined,
  label: option,
}));

const ControlLatest: FC<ControlProps> = ({ narrativeDoc }) => {
  const { modalContents, setModalContents } = useContext(ModalContext);
  return (
    <>
      <Dropdown
        horizontalMenuAlign={'right'}
        options={[{ options: controlLatestOptions }]}
        onChange={(opt) => {
          setModalContents(<span>Some content! {opt[0].label}</span>);
          const dialog: HTMLDialogElement | null = document.querySelector(
            `.${appClasses['kbase-modal']}`
          );
          console.log('modalToggle', { dialog }); // eslint-disable-line no-console
          if (!dialog || !dialog.close) return;
          dialog.close();
          dialog.showModal();
          console.log({ modalContents, opt }); // eslint-disable-line no-console
        }}
      >
        <div>Latest</div>
      </Dropdown>
      <DeleteDialog />
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
      {ver === version.toString() ? (
        <ControlLatest narrativeDoc={narrativeDoc} />
      ) : (
        <ControlPrevious narrativeDoc={narrativeDoc} />
      )}
    </>
  );
};

export default NarrativeControl;
