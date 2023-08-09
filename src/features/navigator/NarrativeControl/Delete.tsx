/* NarrativeControl/Delete */
import { FC } from 'react';
import { Button } from '../../../common/components';
import { useAppDispatch } from '../../../common/hooks';
import { TODOAddLoadingState } from '../common';
import { deleteNarrative } from '../navigatorSlice';
import { ControlProps } from './common';

export const Delete: FC<ControlProps> = ({ narrativeDoc, modalClose }) => {
  const dispatch = useAppDispatch();
  const deleteNarrativeHandler = async () => {
    await TODOAddLoadingState();
    dispatch(deleteNarrative({ wsId: narrativeDoc.access_group }));
    modalClose();
  };

  return (
    <>
      <p>Delete Narrative?</p>
      <p>Deleting a Narrative will permanently remove it and all its data.</p>
      <p>This action cannot be undone!</p>
      <p>Continue?</p>
      <div>
        <Button onClick={deleteNarrativeHandler}>Delete</Button>
        <Button onClick={modalClose}>Cancel</Button>
      </div>
    </>
  );
};
