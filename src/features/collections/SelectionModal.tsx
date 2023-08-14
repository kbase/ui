import { useAppDispatch, useAppSelector } from '../../common/hooks';
import { setUserSelection } from './collectionsSlice';
import { Button } from '../../common/components';
import { useEffect } from 'react';
import { Modal } from '../layout/Modal';

export const SelectionModal = ({
  collectionId,
  showExport,
}: {
  collectionId: string;
  showExport: () => void;
}) => {
  const dispatch = useAppDispatch();

  const currentSelection = useAppSelector(
    (state) => state.collections.currentSelection
  );
  const _verifiedSelectionId = useAppSelector(
    (state) => state.collections._verifiedSelectionId
  );

  // Reset selection when collectionId changes
  useEffect(() => {
    dispatch(setUserSelection([]));
  }, [collectionId, dispatch]);

  return (
    <Modal
      title={'Selection Options'}
      body={
        <ul>
          <li>
            Your current selection includes {currentSelection.length} items.
          </li>
          <li>Selection ID (if processed): {_verifiedSelectionId}</li>
          <li>Selection: {currentSelection.join(', ')}</li>
        </ul>
      }
      footer={
        <>
          <Button color="danger" onClick={() => dispatch(setUserSelection([]))}>
            Clear Selection
          </Button>
          <Button color="primary" onClick={() => showExport()}>
            Save Selection to Narrative
          </Button>
        </>
      }
    />
  );
};
