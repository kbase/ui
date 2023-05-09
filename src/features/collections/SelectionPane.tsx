import { useAppDispatch, useAppSelector } from '../../common/hooks';
import { setUserSelection } from './collectionsSlice';
import { Button } from '../../common/components';
import { useEffect } from 'react';

export const SelectionPane = ({ collectionId }: { collectionId: string }) => {
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
    <>
      <h3>Selection Options</h3>
      <ul>
        <li>
          Your current selection includes {currentSelection.length} items.
        </li>
        <li>Selection ID (if processed): {_verifiedSelectionId}</li>
        <li>Selection: {currentSelection.join(', ')}</li>
      </ul>
      <Button onClick={() => dispatch(setUserSelection([]))}>
        Clear Selection
      </Button>
    </>
  );
};
