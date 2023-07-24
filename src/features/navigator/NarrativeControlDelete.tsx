/* NarrativeControlDelete */
import { FC } from 'react';
import { Button } from '../../common/components';
import { useAppDispatch } from '../../common/hooks';
import { NarrativeDoc } from '../../common/types/NarrativeDoc';
import { deleteNarrative } from './navigatorSlice';

export const Delete: FC<{
  narrativeDoc: NarrativeDoc;
  modalClose: () => void;
}> = ({ narrativeDoc, modalClose }) => {
  const dispatch = useAppDispatch();
  const deleteNarrativeHandler = async () => {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(dispatch(deleteNarrative({ wsId: narrativeDoc.access_group })));
      }, 1000);
    });
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
