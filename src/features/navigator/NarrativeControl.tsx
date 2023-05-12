import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { NarrativeDoc } from '../../common/types/NarrativeDoc';
import classes from './NarrativeControl.module.scss';

const ControlLatest: FC<{}> = (props) => {
  return (
    <>
      <li>Manage Sharing</li>
      <li>Copy this Narrative</li>
      <li>Rename</li>
      <li>Link to Organization</li>
      <li>Delete</li>
    </>
  );
};

const ControlPrevious: FC<{}> = (props) => {
  return (
    <>
      <li>Copy</li>
      <li>Restore</li>
    </>
  );
};

const NarrativeControl: FC<{ narrativeDoc: NarrativeDoc }> = ({
  narrativeDoc,
}) => {
  const { ver } = useParams();
  const { access_group: wsId, version } = narrativeDoc;
  const dialog = (
    <>
      <dialog className={classes['narrative-control']}>
        <ul>
          {ver === version.toString() ? <ControlLatest /> : <ControlPrevious />}
        </ul>
      </dialog>
    </>
  );
  const clickHandler = () => {
    const dialog: HTMLDialogElement | null = document.querySelector(
      `.${classes['narrative-control']}`
    );
    if (!dialog) {
      return;
    }
    if (dialog.open) {
      return dialog.close();
    }
    return dialog.showModal();
  };
  return (
    <>
      <span onClick={clickHandler}>{wsId}</span>
      {dialog}
    </>
  );
};

export default NarrativeControl;
