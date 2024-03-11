import { useAppDispatch, useAppSelector } from '../../common/hooks';
import { setLocalSelection, useCurrentSelection } from './collectionsSlice';
import { Button } from '../../common/components';
import { Modal } from '../layout/Modal';

export const SelectionModal = ({
  collectionId,
  showExport,
}: {
  collectionId: string;
  showExport: () => void;
}) => {
  const dispatch = useAppDispatch();

  const currentSelection = useCurrentSelection(collectionId);
  const verifiedSelectionId = useAppSelector(
    (state) => state.collections.clns[collectionId]?.selection._verifiedId
  );

  return (
    <Modal
      title={'Selection Options'}
      body={
        <ul>
          <li>
            Your current selection includes {currentSelection.length} items.
          </li>
          <li>Selection ID (if processed): {verifiedSelectionId}</li>
          <li>Selection: {currentSelection.join(', ')}</li>
        </ul>
      }
      footer={
        <>
          <Button
            color="danger"
            onClick={() => dispatch(setLocalSelection([collectionId, []]))}
          >
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
